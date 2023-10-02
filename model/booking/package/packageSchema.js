const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const bookingPackageSchema = new Schema({
    title: String,
    description: String,
    slugOfGearbox:String,
    gearbox:String,
    areas: [
        {
        areaName: String
        }
    ],
    postCode: [
        {
            postCode: String,
        }
    ],
    offerSaving: String,
    price: String,
    priecBeforeSele: String,
    numberHour: String,
});


// Create a model based on that schema
const BookingPackage = mongoose.model("bookingPackage", bookingPackageSchema);

module.exports = BookingPackage

