
const CheckEmail = require("../../../model/booking/checkout/checkEmail/checkEmailSchema");
const GiftCheckoutSchema = require("../../../model/gift/giftCheckoutSchema");
const Gift = require('../../../model/gift/giftSchema');
const NotificationCreator = require("../../notification/notificationCreator");

const moment = require('moment');


const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const stripe = require('stripe')(
    process.env.STRIPE_PRIVATE_KEY
)

exports.createPaymentAndGetUrlPaymentForGift = async (req, res) => {
    try {
        const giftCheckoutReceivedData = req.body;

        await validateVerificationNumber(giftCheckoutReceivedData);

        // Generate a line item for the received data
        const lineItem = await generateLineItem(giftCheckoutReceivedData);
    console.log("ss");

        const lineItems = [lineItem]

        // Save checkoutInfo to the database.
        // Assuming saveGiftCheckoutSchema is expecting the original data and the created line item
        const savedGiftCheckoutSchema = await saveGiftCheckoutSchema(giftCheckoutReceivedData, lineItem);

        // Assuming createStripePaymentIntent is expecting an array of line items
        const paymentIntent = await createStripePaymentIntent(giftCheckoutReceivedData,lineItems,savedGiftCheckoutSchema);


        res.json({ url: paymentIntent.url, data: savedGiftCheckoutSchema });
    } catch (error) {
        handleError(res, error);
    }
};


async function validateVerificationNumber(giftCheckoutReceivedData) {
    const email = String(giftCheckoutReceivedData.senderEmail);
    const otp = String(giftCheckoutReceivedData.senderOTP);

    const existingEmailRecord = await CheckEmail.findOne({
        email: email,
        verificationNumber: otp
    });

    if (!existingEmailRecord) {
        throw new Error("Verification number is not valid");
    }
}
async function generateLineItem(giftCheckoutItem) {

    if (giftCheckoutItem.cardId) {
        validatePackageIdFormat(giftCheckoutItem.cardId);

        console.log(`giftResult ${giftCheckoutItem.cardId}`);

        let giftResult = await fetchGiftById(giftCheckoutItem.cardId);

        return {
            price_data: {
                currency: 'gbp',
                product_data: {name: giftResult.name},
                unit_amount: convertToNumber(giftResult.price) * 100,
            },
            quantity: 1,
        };
    } else {
        // Throwing an error when packageId is not found
        throw new Error("packageId is required but was not found.");
    }
}


async function fetchGiftById(giftId) {
    try {
        const result = await Gift.findById(giftId);
        return result;
    } catch (err) {
        console.error(err);
        throw err; // Rethrow the error to handle it in the calling function
    }
}

function validatePackageIdFormat(packageId) {
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
        throw new Error("Invalid packageId format: " + packageId);
    }
}



async function createStripePaymentIntent(giftCheckoutReceivedData,lineItems,savedGiftCheckoutSchema) {
    giftCheckoutReceivedData.success_url += "?id=" + savedGiftCheckoutSchema._id;
    return stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: giftCheckoutReceivedData.success_url,
        cancel_url: giftCheckoutReceivedData.cancel_url,
        line_items: lineItems,
    });
}

async function saveGiftCheckoutSchema(giftCheckoutReceivedData) {
    // Format the current date as "YYYY-MM-DD : ha" (e.g., "2023-11-04 : 3pm")
    const formattedDate = moment().format('YYYY-MM-DD : ha');

    const checkoutInfo = new GiftCheckoutSchema({...giftCheckoutReceivedData});

    return checkoutInfo.save();
}

function handleError(res, error) {
    console.error(error);
    if (!res.headersSent) {
        res.status(500).json({error: error.message});
    }
}

function convertToNumber(value) {
    if (Number.isInteger(value)) {
        return value;
    }
    if (typeof value !== 'string') {
        throw new Error('The provided value is neither an integer nor a string. = ' + value);
    }

    const withoutCommaAndExtraPeriods = value.replace(/,/g, '').replace(/\.+(?=\d*\.)/g, '');
    return parseFloat(withoutCommaAndExtraPeriods);
}

////////////// get CheckoutInfos .///////////////////////////////

exports.getAllCheckoutInfos = async (req, res) => {
    try {
        const checkoutInfos = await GiftCheckoutSchema.find({})
        .sort({ createdAt: -1 })
        .populate('cardId');
        res.json(checkoutInfos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCheckoutInfoById = async (req, res) => {
    try {
        const id = req.params.id; // Retrieve the ID from request parameters

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        // Find the checkout info by ID
        const checkoutInfo = await GiftCheckoutSchema.findById(id);

        if (!checkoutInfo) {
            return res.status(404).json({ message: "No checkout info found with this ID" });
        }

        res.json(checkoutInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCheckoutInfo = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        // Ensure only the status field is being updated
        const updateData = {};
        if (req.body.status) {
            updateData.status = req.body.status;
        } else {
            return res.status(400).json({ message: "Status is required" });
        }

        const checkoutInfo = await GiftCheckoutSchema.findByIdAndUpdate(id, updateData, { new: true });

        if (!checkoutInfo) {
            return res.status(404).json({ message: "No checkout info found with this ID" });
        }

        // Check if status is "success"
        if (updateData.status === "success") {
            try {
                const senderText = `Gift Order from ${checkoutInfo.senderName} to ${checkoutInfo.deliverName}`;
                await NotificationCreator.createWebsiteAdminNotification(senderText, "Gift Order", id, "giftCheckout");
            } catch (notificationErr) {
                console.error(notificationErr);
                return res.status(500).json({ error: "An error occurred while creating the notification" });
            }
        }

        res.json({ status: "success" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

