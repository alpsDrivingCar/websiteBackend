const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");
const CheckEmail = require("../../../../model/booking/checkout/checkEmail/checkEmailSchema");
const PackageSchema = require("../../../../model/booking/package/packageSchema");
const OfferSchema = require("../../../../model/offer/offerSchema");
const moment = require('moment');


const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

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

exports.updateSaveStatusAndChangedBy = async (req, res) => {
    try {
        const checkoutInfoId = req.params.id;
        const { saveStatus, changedSaveStatusBy } = req.body;

        // Validate the new save status
        if (!['un-save', 'save', 'in-progress'].includes(saveStatus)) {
            return res.status(400).json({ error: 'Invalid save status' });
        }

        // Check if changedSaveStatusBy is provided and not empty
        if (!changedSaveStatusBy || changedSaveStatusBy.trim() === '') {
            return res.status(400).json({ error: 'changedSaveStatusBy is required' });
        }

        // Update the document
        const updatedCheckoutInfo = await CheckoutInfo.findByIdAndUpdate(
            checkoutInfoId,
            { $set: { saveStatus, changedSaveStatusBy } },
            { new: true } // return the updated document
        );

        if (!updatedCheckoutInfo) {
            return res.status(404).json({ error: 'CheckoutInfo not found' });
        }

        res.json({ data: updatedCheckoutInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};

exports.createPaymentAndGetUrlPayment = async (req, res) => {
    try {
        const receivedData = req.body;
        const { studentInfo, orderInfo } = receivedData;

        await validateVerificationNumber(studentInfo);
        const lineItems = await generateLineItems(orderInfo);

        // Create Stripe payment intent.
        const paymentIntent = await createStripePaymentIntent(orderInfo, lineItems);

        // Save checkoutInfo to the database.
        const savedCheckoutInfo = await saveCheckoutInfo(receivedData, orderInfo);

        res.json({ url: paymentIntent.url, data: savedCheckoutInfo });
    } catch (error) {
        handleError(res, error);
    }
};

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


    if (orderInfo.testBooking === 'book') {
        items.push({
            name: "Test Booking",
            quantity: 1,
            packageId: null,
            price: 14000
        });
    }
    items.push({
        name: "Transaction fees",
        quantity: 1,
        packageId: null,
        price: 350
    });


    return Promise.all(items.map(async item => {
        if (item.packageId) {
            validatePackageIdFormat(item.packageId);

            let packageResult;
            if (orderInfo.typeOfLesson === "hot-offer") {
                packageResult = await fetchOfferPackage(item.packageId);
            } else {
                packageResult = await fetchRegularPackage(item.packageId);
            }

            return {
                price_data: {
                    currency: 'gbp',
                    product_data: { name: item.name },
                    unit_amount: convertToNumber(packageResult.price) * 100,
                },
                quantity: item.quantity,
            };
        } else {
            return {
                price_data: {
                    currency: 'gbp',
                    product_data: { name: item.name },
                    unit_amount: convertToNumber(item.price),
                },
                quantity: item.quantity,
            };
        }
    }));
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
    // Format the current date as "YYYY-MM-DD : ha" (e.g., "2023-11-04 : 3pm")
    const formattedDate = moment().format('YYYY-MM-DD : ha');

    const checkoutInfo = new CheckoutInfo({
        ...receivedData,
        orderInfo: {...orderInfo, status: "pending", bookingDate: formattedDate}
    });

    return checkoutInfo.save();
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