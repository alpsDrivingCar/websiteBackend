const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");
const CheckEmail = require("../../../../model/booking/checkout/checkEmail/checkEmailSchema");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const stripe = require('stripe')(
    process.env.STRIPE_PRIVATE_KEY
)

exports.payment = async (req, res) => {
// app.post('/create-checkout', async (req, res) => {
    try {

        const receivedData = req.body; // Assuming the request contains the JSON data

        // Create a new document based on the schema and save it to MongoDB
        const checkoutInfo = new CheckoutInfo(receivedData);
        // await checkoutInfo.save();

        // Log the checkoutInfo to the console
        console.log("Received checkoutInfo:");
        console.log(checkoutInfo);

        try {
            // Check if the email exists in your database
            let existingEmailRecord = await CheckEmail.findOne({ email: receivedData.studentInfo.email, verificationNumber:  receivedData.studentInfo.verificationNumber });

            if (!existingEmailRecord) {
                res.status(404).json({error: "Verification number is not valid"})
                return
            }

        }catch (e) {
           console.log("sss" + e)
        }

        console.log("qqq")

        const paymentIntent = await stripe.checkout.sessions.create({
            mode: 'payment', // Use 'payment' mode for one-time payments
            success_url: checkoutInfo.orderInfo.success_url,
            cancel_url: checkoutInfo.orderInfo.cancel_url,
            line_items: checkoutInfo.orderInfo.items.map(item => {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: "10000", // Assuming the price is in dollars
                    },
                    quantity: item.quantity,
                };
            }),
        });

        res.json({url: paymentIntent.url})
    } catch (e) {
        res.status(500).json({error: e.message})
    }
}


