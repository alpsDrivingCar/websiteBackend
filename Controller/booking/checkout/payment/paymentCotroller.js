const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");
const CheckEmail = require("../../../../model/booking/checkout/checkEmail/checkEmailSchema");
const PackageSchema = require("../../../../model/booking/package/packageSchema");
const OfferSchema = require("../../../../model/offer/offerSchema");
const InstructorsUserSchema = require("../../../../model/user/Instructor");
const LessonEvent = require("../../../../model/booking/instructors/lessonEventSchema");

const moment = require('moment');
const crypto = require('crypto');
const ejs = require('ejs');
const nodemailer = require('nodemailer');


const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");


const stripe = require('stripe')(
    process.env.STRIPE_PRIVATE_KEY
)

exports.allPayment = async (req, res) => {
    try {
        CheckoutInfo.find()
            .then(result => {
                // Reverse the result array before sending the response
                const reversedResult = result.reverse();
                res.json({data: reversedResult});
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({error: 'An error occurred while fetching payments.'});
            });
    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An unexpected error occurred.'});
    }
};

exports.getPayment = async (req, res) => {
    try {
        const checkoutInfo = await CheckoutInfo.findById(req.params.id)
            .populate('orderInfo.instructorsId')
            .exec()

        res.json({data: checkoutInfo});

    } catch (e) {
        res.status(500).json({error: e.message})
    }
}


exports.createPaymentAndGetUrlPayment = async (req, res) => {
    try {
        const receivedData = req.body;
        const { studentInfo, orderInfo } = receivedData;

        const isAvailable = await checkInstructorAvailability(orderInfo);
        if (!isAvailable) {
            return res.status(404).json({ message: 'Instructor has become unavailable at the requested times.' });
        }

        const lineItems = await generateLineItems(orderInfo);

        const reservationCode = generateReservationCode(studentInfo.phoneNumber);
        orderInfo.reservationCode = reservationCode;

        // Save checkoutInfo to the database.
        const savedCheckoutInfo = await saveCheckoutInfo(receivedData, orderInfo);

        // Create Stripe payment intent.
        const paymentIntent = await createStripePaymentIntent(orderInfo, lineItems);
        await sendEmail(studentInfo.email,reservationCode);

        res.json({ url: paymentIntent.url, data: savedCheckoutInfo });
    } catch (error) {
        handleError(res, error);
    }
};

async function checkInstructorAvailability(orderInfo) {
    const { items, instructorsId } = orderInfo; // Assuming instructorsId is a single ID, not an array

    // Ensure required information is provided
    if (!items || items.length === 0 || !instructorsId) {
        throw new Error('Order items and instructor ID are required parameters.');
    }

    // Extracting availableHours from all items into a single array of Date objects
    let availableTimes = items.reduce((acc, item) => {
        if (item.availableHours && Array.isArray(item.availableHours)) {
            const timesAsDates = item.availableHours.map(time => new Date(time));
            acc = acc.concat(timesAsDates);
        }
        return acc;
    }, []);

    if (availableTimes.length === 0) {
        console.log('No available times found in the order items.');
        return false; // Indicating no available times to check against
    }

    // Check availability for the specified instructor at each provided time
    for (const time of availableTimes) {
        const hasLesson = await LessonEvent.findOne({
            instructorId: instructorsId, // Directly use the single ID provided
            startTime: { $lte: time },
            endTime: { $gte: time }
        });
        if (hasLesson) {
            // This instructor is not available at this time
            return false; // Instructor is unavailable at least one of the provided times
        }
    }

    // If the loop completes without finding any unavailability, the instructor is available
    return true; // The instructor is available at all provided times
}


async function sendEmail(to,reservationCode) {
    try {
        const template = fs.readFileSync('reservationConfirmationEmailTemplate.ejs', 'utf8');
        const htmlMessage = ejs.render(template, {
            reservationCode,
        });

        const mailOptions = {
        from: 'alpsdrivingschool@gmail.com',
        to: to,
        subject: `Your Reservation Confirmation`,
        html: htmlMessage,
    };

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'alpsdrivingschool@gmail.com',
            pass: process.env.SECRET_PASSWORD,
        },
    });
    // Send email
    await transporter.sendMail(mailOptions);

    }catch (e) {
        console.error('Error sending email:', e);
    }
}


async function validateVerificationNumber(studentInfo) {
    const existingEmailRecord = await CheckEmail.findOne({
        email: studentInfo.email,
        verificationNumber: studentInfo.verificationNumber
    });

    if (!existingEmailRecord) {
        throw new Error("Verification number is not valid");
    }
}

async function generateLineItems(orderInfo) {
    let items = [...orderInfo.items];

    // Initialize total price if not already
    if (typeof orderInfo.price !== 'number' || isNaN(orderInfo.price)) {
        orderInfo.price = 0;
    }

    // Add test booking and transaction fees to the items list
    if (orderInfo.testBooking === 'book') {
        items.push({
            name: "Test Booking",
            quantity: 1,
            packageId: null,
            price: 14000 // Assuming price is in pence
        });
    }
    items.push({
        name: "Transaction fees",
        quantity: 1,
        packageId: null,
        price: 350 // Assuming price is in pence
    });

    const lineItems = await Promise.all(items.map(async item => {
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
                unitAmount = convertToNumber(packageResult.price) * 100;
                orderInfo.price = convertToNumber(packageResult.price);
            } else {
                throw new Error('Invalid package price');
            }
        } else {
            // Validate item.price before using it
            if (!isNaN(parseFloat(item.price))) {
                unitAmount = convertToNumber(item.price);
            } else {
                throw new Error('Invalid item price');
            }
        }

        // Add to total price
        // orderInfo.price += unitAmount * item.quantity;

        return {
            price_data: {
                currency: 'gbp',
                product_data: { name: item.name || packageResult?.title },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        };
    }));

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
        { 'typeOffer.offers._id': new mongoose.Types.ObjectId(packageId) },
        { 'typeOffer.offers.$': 1 }
    );

    if (!offerSchemaResult || !offerSchemaResult.typeOffer || offerSchemaResult.typeOffer.length === 0) {
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

async function createStripePaymentIntent(orderInfo, lineItems) {
    return stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: orderInfo.success_url,
        cancel_url: orderInfo.cancel_url,
        line_items: lineItems,
    });
}

async function saveCheckoutInfo(receivedData, orderInfo) {
    const formattedDate = moment().format('YYYY-MM-DD : ha'); // Format the date
    receivedData.studentInfo.address = receivedData.orderInfo.postCode;
    orderInfo.status = "pending";
    orderInfo.bookingDate = formattedDate;

    // Check if checkoutInfoId is provided to update existing checkoutInfo
    if (orderInfo.checkoutInfoId) {
        const checkoutInfoToUpdate = await CheckoutInfo.findById(orderInfo.checkoutInfoId);
        if (!checkoutInfoToUpdate) {
            throw new Error('CheckoutInfo not found.');
        }

        // Update the checkoutInfo with new data
        checkoutInfoToUpdate.orderInfo = { ...checkoutInfoToUpdate.orderInfo, ...orderInfo };
        checkoutInfoToUpdate.studentInfo = { ...checkoutInfoToUpdate.studentInfo, ...receivedData.studentInfo };

        // You might need to update other fields as necessary
        checkoutInfoToUpdate.orderInfo.success_url += "?id=" + checkoutInfoToUpdate._id; // Assuming you need to append the ID

        return checkoutInfoToUpdate.save();
    } else {
        // If checkoutInfoId is not provided, create new checkoutInfo
        const checkoutInfo = new CheckoutInfo({
            ...receivedData,
            orderInfo: { ...orderInfo }
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
    if (Number.isInteger(value)) {
        return value;
    }
    if (typeof value !== 'string') {
        throw new Error('The provided value is neither an integer nor a string. = ' + value );
    }

    const withoutCommaAndExtraPeriods = value.replace(/,/g, '').replace(/\.+(?=\d*\.)/g, '');
    return parseFloat(withoutCommaAndExtraPeriods);
}

function generateReservationCode(orderId) {
    const hash = crypto.createHash('sha256');
    const salt = crypto.randomBytes(16).toString('hex');
    hash.update(`${orderId}${salt}`);
    return hash.digest('hex').substring(0, 8);
}
