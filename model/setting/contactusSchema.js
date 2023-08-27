const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const contactUsSchema = new Schema({
    email: String,
    phoneNumber:String,
    location:String,
    name:String,
});


// Create a model based on that schema
const ContactUs = mongoose.model("contactUs", contactUsSchema);

module.exports = ContactUs

