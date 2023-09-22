const mongoose = require("mongoose");

// Define the Mongoose Schema for checkoutInfo
const checkEmailSchema = new mongoose.Schema({
    email: String,
    verificationNumber: String
});


// Create a Mongoose model from the schema
const CheckEmail = mongoose.model("CheckEmail", checkEmailSchema);

module.exports = CheckEmail;
