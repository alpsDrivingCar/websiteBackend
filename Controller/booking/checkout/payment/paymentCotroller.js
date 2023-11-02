const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");
const CheckEmail = require("../../../../model/booking/checkout/checkEmail/checkEmailSchema");
const PackageSchema = require("../../../../model/booking/package/packageSchema");
const OfferSchema = require("../../../../model/offer/offerSchema");

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
                res.json({data: result});
            })
            .catch(err => {
                console.log(err);
            });
    } catch (e) {
        res.status(500).json({error: e.message})
    }
}

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

        // Validate the verification number with email.
        const existingEmailRecord = await CheckEmail.findOne({
            email: receivedData.studentInfo.email,
            verificationNumber: receivedData.studentInfo.verificationNumber
        });

        if (!existingEmailRecord) {
            return res.status(404).json({error: "Verification number is not valid"});
        }

        let items = [...receivedData.orderInfo.items]; // Copying the items

        if (receivedData.orderInfo.testBooking === 'book') {
            items.push({
                name: "Test Booking",
                quantity: 1,
                packageId: null, // This can be null or a valid ID if you have one for this package
                price: 14000 // Converted to the smallest currency unit, pence in this case
            });
        }

        const lineItems = await Promise.all(items.map(async item => {
            if (item.packageId) {
                const packageId = item.packageId;
                if (!mongoose.Types.ObjectId.isValid(packageId)) {
                    throw new Error("Invalid packageId format: " + packageId);
                }

                let packageResult;
                if (receivedData.orderInfo.typeOfLesson === "hot-offer") {
                    const offerSchemaResult = await OfferSchema.findOne(
                        {'typeOffer.offers._id': new mongoose.Types.ObjectId(packageId)},
                        {'typeOffer.offers.$': 1}  // Projection to return only the matched offers array
                    );

                    if (!offerSchemaResult || !offerSchemaResult.typeOffer || offerSchemaResult.typeOffer.length === 0) {
                        throw new Error("No data based on this id");
                    }

                    // Extracting the matched offers array from the result
                    packageResult = offerSchemaResult.typeOffer[0].offers[0];
                    console.log(packageResult);
                } else {
                    packageResult = await PackageSchema.findById(packageId);
                    if (!packageResult) {
                        throw new Error("No package found for ID: " + packageId);
                    }
                }

                console.log("packageResult  = " +packageResult )
                
                return {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: convertToNumber(packageResult.price) * 100, // Convert price to pence
                    },
                    quantity: item.quantity,
                };
            } else {
                return {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: convertToNumber(item.price), // Use the provided price if packageId is not set
                    },
                    quantity: item.quantity,
                };
            }
        }));

        // Create Stripe payment intent.
        const paymentIntent = await stripe.checkout.sessions.create({
            mode: 'payment',
            success_url: receivedData.orderInfo.success_url,
            cancel_url: receivedData.orderInfo.cancel_url,
            line_items: lineItems,
        });

        // Save checkoutInfo to the database.
        const checkoutInfo = new CheckoutInfo({
            ...receivedData,
            orderInfo: {...receivedData.orderInfo, status: "pending"}
        });
        const savedCheckoutInfo = await checkoutInfo.save();

        res.json({url: paymentIntent.url, data: savedCheckoutInfo});
    } catch (error) {
        console.error(error);
        if (!res.headersSent) { // Check if headers have been sent to prevent "Cannot set headers after they are sent to the client" error
            return res.status(500).json({error: error.message});
        }
    }
};


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