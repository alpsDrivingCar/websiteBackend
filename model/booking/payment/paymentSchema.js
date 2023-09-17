const mongoose = require("mongoose");

// Define the Mongoose Schema for checkoutInfo
const checkoutInfoSchema = new mongoose.Schema({
    orderInfo: {
        postCode: String,
        typeOfLesson: String,
        typeOfGearbox: String,
        instructorsId: String,
        success_url: String,
        cancel_url: String,
        items: [
            {
                quantity: Number,
                name: String,
                packageId: String, // Move packageId to items
                packageName: String, // Move packageName to items
                dayTime: String, // Change 'time' to 'dayTime' in items
                availableHours: String // Add availableHours field to items
            },
        ],
    },
    studentInfo: {
        name: String,
        phoneNumber: String,
        email: String,
        address: String,
        dateOfBirth: Date,
    },

});


// Create a Mongoose model from the schema
const CheckoutInfo = mongoose.model("CheckoutInfo", checkoutInfoSchema);

module.exports = CheckoutInfo;
