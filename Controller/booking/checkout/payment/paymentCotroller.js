const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");
const CheckEmail = require("../../../../model/booking/checkout/checkEmail/checkEmailSchema");
const PackageSchema = require("../../../../model/booking/package/packageSchema");
const OfferSchema = require("../../../../model/offer/offerSchema");
const InstructorsUserSchema = require("../../../../model/user/Instructor");
const LessonEvent = require("../../../../model/booking/instructors/lessonEventSchema");
const Pupil = require("../../../../model/user/Pupil");
const axios = require("axios");
const NotificationCreator = require("../../../notification/notificationCreator");
const { updateOrderStatus } = require('../../../../Controller/booking/checkout/payment/updateOrder')
const moment = require("moment");
const crypto = require("crypto");
const ejs = require("ejs");
const nodemailer = require("nodemailer");

const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const { getElavonTransactionStatus } = require("./elavonUtils");

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

exports.allPayment = async (req, res) => {
  try {
    CheckoutInfo.find()
      .then((result) => {
        // Reverse the result array before sending the response
        const reversedResult = result.reverse();
        res.json({ data: reversedResult });
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching payments." });
      });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const checkoutInfo = await CheckoutInfo.findById(req.params.id)
      .populate("orderInfo.instructorsId")
      .exec();

    res.json({ data: checkoutInfo });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.createPaymentAndGetUrlPaymentNew = async (req, res) => {
  try {
    const receivedData = req.body;
    const { studentInfo, orderInfo, isMobileOrder } = receivedData;
    console.log("orderInfo123123: ", orderInfo);
    const { isMockTestBooking = false } = req.query;
    const isMockTestBookingBool =
      isMockTestBooking === true || isMockTestBooking === "true";
    if (!studentInfo.gender) studentInfo.gender = 'male';
    
    if (isMockTestBookingBool) {
      const mockPackageId = process.env.MOCK_TEST_PACKAGEID;
      console.log("mockPackageId123123: ", mockPackageId);
      if (!mockPackageId) {
        return res.status(500).json({
          message: "Server misconfiguration: MOCK_TEST_PACKAGEID is not set",
        });
      }
      if (!mongoose.Types.ObjectId.isValid(mockPackageId)) {
        return res.status(500).json({
          message: "Server misconfiguration: MOCK_TEST_PACKAGEID is invalid",
        });
      }

      // Ensure the package exists (and will be payable) before proceeding
      try {
        await fetchRegularPackage(mockPackageId);
      } catch (e) {
        return res.status(500).json({
          message: "Server misconfiguration: Mock test package not found",
        });
      }

      const incomingAvailableHours =
        orderInfo?.items?.[0]?.availableHours &&
        Array.isArray(orderInfo.items[0].availableHours)
          ? orderInfo.items[0].availableHours
          : [];

      orderInfo.items = [
        {
          packageId: mockPackageId,
          quantity: 1,
          availableHours: incomingAvailableHours,
        },
      ];
      orderInfo.typeOfGearbox = "automatic";
      orderInfo.instructorsId = process.env.MOCK_TEST_INSTRUCTORID;
      orderInfo.typeOfLesson = "mock_test";
    } else {
      // Validate introductory offer before proceeding
      await validateIntroductoryOffer(orderInfo, studentInfo);
    }
    
    // const isAvailable = await checkInstructorAvailability(orderInfo);
    // if (!isAvailable) {
    //   return res.status(404).json({
    //     message: "Instructor has become unavailable at the requested times.",
    //   });
    // }
    isMobileOrder ? orderInfo.orderType = 'app' : orderInfo.orderType = 'website';

    const lineItems = await generateLineItems(orderInfo);

    const reservationCode = generateReservationCode(studentInfo.phoneNumber);
    orderInfo.reservationCode = reservationCode;

    // Save checkoutInfo to the database.
    const savedCheckoutInfo = await saveCheckoutInfo(receivedData, orderInfo);
    // Create Elavon payment intent.
    const paymentIntent = await createElavonPaymentIntent(lineItems);
    let paymentSession
    if (isMobileOrder) {
      paymentSession = await createElavonPaymentSessionMobile(paymentIntent.href, savedCheckoutInfo._id);
    } else {
      paymentSession = await createElavonPaymentSession(paymentIntent.href);
    }
    savedCheckoutInfo.orderInfo.elavonSessionId = paymentSession.id;
    await savedCheckoutInfo.save();

    CheckoutInfo.findById(savedCheckoutInfo._id)
      .then((checkoutInfo) => {
        checkoutInfo.orderInfo.elavonSessionId = paymentSession.id;
        return checkoutInfo.save();
      })
      .catch((err) => {
        console.error("Error saving Elavon session ID:", err);
        return res.status(500).json({
          error: "Failed to save Elavon session ID",
        });
      });

    await sendEmail(studentInfo.email, reservationCode);
    sendNotifications(receivedData, String(savedCheckoutInfo._id));

    const baseUrl = process.env.ELAVON_URL.includes('api.eu.convergepay.com') 
      ? 'https://hpp.eu.convergepay.com/'
      : 'https://uat.hpp.converge.eu.elavonaws.com/';
    const paymentLink = `${baseUrl}?sessionId=${paymentSession.id}`;

    res.json({
      url: paymentIntent.url,
      data: savedCheckoutInfo,
      paymentSessionId: paymentSession.id,
      paymentLink,
      backLink: process.env.WEBSITE_URL,
    });
  } catch (error) {
    handleError(res, error);
  }
};

async function checkInstructorAvailability(orderInfo) {
  const { items, instructorsId } = orderInfo; // Assuming instructorsId is a single ID, not an array

  // Ensure required information is provided
  if (!items || items.length === 0 || !instructorsId) {
    throw new Error("Order items and instructor ID are required parameters.");
  }

  // Extracting availableHours from all items into a single array of Date objects
  let availableTimes = items.reduce((acc, item) => {
    if (item.availableHours && Array.isArray(item.availableHours)) {
      const timesAsDates = item.availableHours.map((time) => new Date(time));
      acc = acc.concat(timesAsDates);
    }
    return acc;
  }, []);

  if (availableTimes.length === 0) {
    console.log("No available times found in the order items.");
    return false; // Indicating no available times to check against
  }

  // Check availability for the specified instructor at each provided time
  for (const time of availableTimes) {
    const hasLesson = await LessonEvent.findOne({
      instructorId: instructorsId, // Directly use the single ID provided
      startTime: { $lte: time },
      endTime: { $gte: time },
    });
    if (hasLesson) {
      // This instructor is not available at this time
      return false; // Instructor is unavailable at least one of the provided times
    }
  }

  // If the loop completes without finding any unavailability, the instructor is available
  return true; // The instructor is available at all provided times
}

async function sendNotifications(data, orderId) {
  try {
    const orderText = `New Order From ${ data.studentInfo.name || `${data.studentInfo.firstName} ${data.studentInfo.middleName ? data.studentInfo.middleName + ' ' : ''}${data.studentInfo.lastName}` }`;
    await NotificationCreator.createWebsiteAdminNotification(orderText, "Order", orderId, "lessonsOrder" )
  } catch (error) {
    console.error("Failed to send notifications:", error);
    return res.status(500).json({error: "Failed to send notifications"});
  }
}

async function sendEmail(to, reservationCode) {
  try {
    const template = fs.readFileSync(
      "reservationConfirmationEmailTemplate.ejs",
      "utf8"
    );
    const htmlMessage = ejs.render(template, {
      reservationCode,
    });

    const mailOptions = {
      from: "alpsdrivingschool@gmail.com",
      to: to,
      subject: `Your Reservation Confirmation`,
      html: htmlMessage,
    };

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "alpsdrivingschool@gmail.com",
        pass: process.env.SECRET_PASSWORD,
      },
    });
    // Send email
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.error("Error sending email:", e);
  }
}

async function validateVerificationNumber(studentInfo) {
  const existingEmailRecord = await CheckEmail.findOne({
    email: studentInfo.email,
    verificationNumber: studentInfo.verificationNumber,
  });

  if (!existingEmailRecord) {
    throw new Error("Verification number is not valid");
  }
}

async function validateIntroductoryOffer(orderInfo, studentInfo) {
  if (!orderInfo.items || !Array.isArray(orderInfo.items)) {
    return; // No items to validate
  }

  // Check each item for introductory offers
  for (const item of orderInfo.items) {
    if (!item.packageId) {
      continue; // Skip items without packageId
    }

    let packageResult;
    
    // Fetch the package based on order type
    if (orderInfo.typeOfLesson === "hot-offer") {
      // For hot-offer, fetch the offer first, then get the referenced package
      const offerResult = await fetchOfferPackage(item.packageId);
      if (offerResult && offerResult.packageId) {
        // Fetch the actual package referenced by the offer
        packageResult = await fetchRegularPackage(offerResult.packageId);
      }
    } else {
      // For regular packages, fetch directly
      packageResult = await fetchRegularPackage(item.packageId);
    }

    // Check if this package is an introductory offer
    if (packageResult && packageResult.slugOfType === "our_offers_packages") {
      // Check if a pupil with this phone number already exists
      const existingPupil = await Pupil.findOne({
        phoneNumber: studentInfo.phoneNumber,
      });

      if (existingPupil) {
        throw new Error("Introductory offers can't be booked more than once");
      }
    }
  }
}

async function generateLineItems(orderInfo) {
  let items = [...orderInfo.items];

  // Initialize total price if not already
  if (typeof orderInfo.price !== "number" || isNaN(orderInfo.price)) {
    orderInfo.price = 0;
  }

  // Add test booking and transaction fees to the items list
  if (orderInfo.testBooking === "book") {
    items.push({
      name: "Test Booking",
      quantity: 1,
      packageId: null,
      price: 120.0, // £120.00
    });
  }
  items.push({
    name: "Transaction fees",
    quantity: 1,
    packageId: null,
    price: 3.5, // £3.50
  });

  const lineItems = await Promise.all(
    items.map(async (item) => {
      let unitAmount;

      if (item.packageId) {
        validatePackageIdFormat(item.packageId);

        let packageResult;
        if (orderInfo.typeOfLesson === "hot-offer") {
          packageResult = await fetchOfferPackage(item.packageId);
        } else {
          packageResult = await fetchRegularPackage(item.packageId);
        }

        item.name = packageResult.title;
        // Validate packageResult and packageResult.price before using them
        if (packageResult && !isNaN(parseFloat(packageResult.price))) {
          unitAmount = convertToNumber(packageResult.price);
          orderInfo.price = convertToNumber(packageResult.price);
        } else {
          throw new Error("Invalid package price");
        }
      } else {
        // Validate item.price before using it
        if (!isNaN(parseFloat(item.price))) {
          unitAmount = convertToNumber(item.price);
        } else {
          throw new Error("Invalid item price");
        }
      }

      // Add to total price
      // orderInfo.price += unitAmount * item.quantity;

      return {
        price_data: {
          currency: "gbp",
          product_data: { name: item.name || packageResult?.title },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    })
  );

  // Return line items
  return lineItems;
}

function validatePackageIdFormat(packageId) {
  if (!mongoose.Types.ObjectId.isValid(packageId)) {
    throw new Error("Invalid packageId format: " + packageId);
  }
}

async function fetchOfferPackage(packageId) {
  const offerSchemaResult = await OfferSchema.findOne(
    { "typeOffer.offers._id": new mongoose.Types.ObjectId(packageId) },
    { "typeOffer.offers.$": 1 }
  );

  if (
    !offerSchemaResult ||
    !offerSchemaResult.typeOffer ||
    offerSchemaResult.typeOffer.length === 0
  ) {
    throw new Error("No data based on this id = " + packageId);
  }

  return offerSchemaResult.typeOffer[0].offers[0];
}

async function fetchRegularPackage(packageId) {
  const packageResult = await PackageSchema.findById(packageId);
  if (!packageResult) {
    throw new Error("No package found for ID: " + packageId);
  }
  return packageResult;
}

async function createElavonPaymentIntent(lineItems) {
  try {
    const totalAmount = lineItems.reduce(
      (total, item) => total + item.price_data.unit_amount,
      0
    );
    const response = await axios({
      method: "POST",
      url: `${process.env.ELAVON_URL}/orders`,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.ELAVON_MERCHANT_ALIAS}:${process.env.ELAVON_SECRET_KEY}`
          ).toString("base64"),
      },
      data: {
        total: {
          amount: totalAmount.toString(),
          currencyCode: "GBP",
        },
        items: lineItems.map((item) => ({
          total: {
            amount: item.price_data.unit_amount.toString(),
            currencyCode: "GBP",
          },
          description: item.price_data.product_data.name,
        })),
      },
    });
    console.log("Elavon order created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create Elavon order:",
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to create Elavon order: ${error.response?.data || error.message}`
    );
  }
}

async function createElavonPaymentSession(orderId) {
  try {
    const response = await axios({
      method: "POST",
      url: `${process.env.ELAVON_URL}/payment-sessions`,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.ELAVON_MERCHANT_ALIAS}:${process.env.ELAVON_SECRET_KEY}`
          ).toString("base64"),
      },
      data: {
        order: orderId,
        hppType: "lightbox",
        originUrl: `${process.env.WEBSITE_URL}`,
        doCreateTransaction: true,
      },
    });
    console.log("Elavon payment session created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create Elavon payment session:",
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to create Elavon payment session: ${
        error.response?.data || error.message
      }`
    );
  }
}

async function createElavonPaymentSessionMobile(orderId, packageOrderId) {
  try {
    const response = await axios({
      method: "POST",
      url: `${process.env.ELAVON_URL}/payment-sessions`,
      headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(
        `${process.env.ELAVON_MERCHANT_ALIAS}:${process.env.ELAVON_SECRET_KEY}`
        ).toString("base64"),
      },
      data: {
      order: orderId,
      hppType: "fullPageRedirect",
      originUrl: `${process.env.WEBSITE_URL}`,
      returnUrl: `${process.env.WEBSITE_URL}/reservation-succeed?id=${packageOrderId}`,
      cancelUrl: `${process.env.WEBSITE_URL}`,
      doCreateTransaction: true,
      },
    });
    console.log("Elavon payment session created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create Elavon payment session:",
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to create Elavon payment session: ${
        error.response?.data || error.message
      }`
    );
  }
}

exports.checkElavonSessionExpiry = async (req, res) => {
  const sessionId = req.query.sessionId || req.params.id;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const sessionStatus = await getElavonSessionStatus(sessionId);
    const isExpired = checkExpiration(sessionStatus.expiresAt);

    return res.status(200).json({
      data: {
        status: isExpired ? "expired" : "active",
        expiresAt: sessionStatus.expiresAt,
        sessionData: sessionStatus,
      },
    });
  } catch (error) {
    console.error("Session check failed:", error);
    return res.status(500).json({
      error: "Failed to check session status",
      details: error.message,
    });
  }
};

async function getElavonSessionStatus(sessionId) {
  const response = await axios({
    method: "GET",
    url: `${process.env.ELAVON_URL}/payment-sessions/${sessionId}`,
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.ELAVON_MERCHANT_ALIAS}:${process.env.ELAVON_SECRET_KEY}`
        ).toString("base64"),
    },
  });
  return response.data;
}

function checkExpiration(expiryTime) {
  const currentTime = new Date().toISOString();
  return currentTime > expiryTime;
}

async function saveCheckoutInfo(receivedData, orderInfo) {
  const formattedDate = moment().format("YYYY-MM-DD : ha"); // Format the date
  receivedData.studentInfo.postCode = receivedData.orderInfo.postCode;
  orderInfo.status = "pending";
  orderInfo.bookingDate = formattedDate;

  // Check if checkoutInfoId is provided to update existing checkoutInfo
  if (orderInfo.checkoutInfoId) {
    const checkoutInfoToUpdate = await CheckoutInfo.findById(
      orderInfo.checkoutInfoId
    );
    if (!checkoutInfoToUpdate) {
      throw new Error("CheckoutInfo not found.");
    }

    // Update the checkoutInfo with new data
    checkoutInfoToUpdate.orderInfo = {
      ...checkoutInfoToUpdate.orderInfo,
      ...orderInfo,
    };
    checkoutInfoToUpdate.studentInfo = {
      ...checkoutInfoToUpdate.studentInfo,
      ...receivedData.studentInfo,
    };

    // You might need to update other fields as necessary
    checkoutInfoToUpdate.orderInfo.success_url +=
      "?id=" + checkoutInfoToUpdate._id; // Assuming you need to append the ID

    return checkoutInfoToUpdate.save();
  } else {
    // If checkoutInfoId is not provided, create new checkoutInfo
    const checkoutInfo = new CheckoutInfo({
      ...receivedData,
      orderInfo: { ...orderInfo },
    });

    orderInfo.success_url += "?id=" + checkoutInfo._id; // Append the new ID to the success_url
    checkoutInfo.orderInfo = orderInfo;

    return checkoutInfo.save();
  }
}

function handleError(res, error) {
  console.error(error);
  if (!res.headersSent) {
    res.status(500).json({ error: error.message });
  }
}

function convertToNumber(value) {
  // Handle numbers (both integers and decimals)
  if (typeof value === "number") {
    return value;
  }
  // Handle strings
  if (typeof value !== "string") {
    throw new Error(
      "The provided value is neither a number nor a string. = " + value
    );
  }

  const withoutCommaAndExtraPeriods = value
    .replace(/,/g, "")
    .replace(/\.+(?=\d*\.)/g, "");
  return parseFloat(withoutCommaAndExtraPeriods);
}

function generateReservationCode(orderId) {
  const hash = crypto.createHash("sha256");
  const salt = crypto.randomBytes(16).toString("hex");
  hash.update(`${orderId}${salt}`);
  return hash.digest("hex").substring(0, 8);
}

exports.checkPendingPayments = async () => {
    const pendingOrders = await CheckoutInfo.find({
        'orderInfo.status': 'pending',
        'createdAt': { $gte: new Date(Date.now() - 1 * 60 * 60 * 1000) } // Last 1 hours
    });

    for (const order of pendingOrders) {
        try {
            // Use your existing getElavonSessionStatus function
            const sessionStatus = await getElavonSessionStatus(order.orderInfo.elavonSessionId);
            let transactionStatus = null;
            let isPaymentCompleted = false;

            if (sessionStatus.transaction) {
                transactionStatus = await getElavonTransactionStatus(sessionStatus.transaction);
            }

            if (transactionStatus && (transactionStatus === 'captured' || transactionStatus === 'settled')) {
              isPaymentCompleted = true;
            }

            if (isPaymentCompleted) {
              console.log('Payment completed for order', order._id);
                await updateOrderStatus({ 
                    params: { id: order._id }, 
                    body: { status: 'success' } 
                }, { json: () => {} }); // Mock response object
            } else {
              console.log('Payment not completed for order', order._id);
            }
        } catch (error) {
            console.error(`Failed to check status for order ${order._id}:`, error);
        }
    }
}