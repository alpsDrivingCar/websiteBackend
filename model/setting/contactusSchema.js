const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const contactusSchema = new Schema({
    email: String,
    phoneNumber: String,
    location: String,
    name: String,
    contactUsType: String,
    source: String,
    description: {
        type: String,
    },
    answer: {
        subject: {
            type: String,
            required: false
        },
        messageBody: {
            type: String,
            required: false
        }
    },
    answered: {
        type: Boolean,
        required: false,
        default: false,
    },
},{
    timestamps:true
});



// Create a model based on that schema
const Contactus = mongoose.model("contactuss", contactusSchema);

module.exports = Contactus

