const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Mongoose Schema for checkoutInfo
const checkoutInfoSchema = new mongoose.Schema({
    orderInfo: {
        postCode: String,
        typeOfLesson: String,//hot-offer , regular
        typeOfGearbox: String,
        instructorsId: {
            type: Schema.Types.ObjectId,
            ref: 'Instructors',
        },
        success_url: String,
        cancel_url: String,
        status: String, //pending , success , failure
        testBooking:String, // slug = book, unbook
        price: {
            type: Number,
            default: 0
        },
        bookingDate: String, // Ensure this is set to String
        items: [
            {
                quantity: Number,
                name: String,
                packageId: String, // Move packageId to items
                packageName: String, // Move packageName to items
                dayTime: String, // Change 'time' to 'dayTime' in items
                availableHours: [Data] // Add availableHours field to items
            },
        ],
    },
    studentInfo: {
        name: String,
        phoneNumber: String,
        email: String,
        address: String,
        dateOfBirth: Date,
        verificationNumber: String
    },
    saveStatus: {
        type: String,
        enum: ['un-save', 'save', 'in-progress'],
        default: 'un-save'
    },
    changedSaveStatusBy: {
        type: String, // or Schema.Types.ObjectId if you reference a user model
        required: false
    }
});


// Create a Mongoose model from the schema
const CheckoutInfo = mongoose.model("CheckoutInfo", checkoutInfoSchema);

module.exports = CheckoutInfo;
