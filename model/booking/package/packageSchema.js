const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingPackageSchema = new Schema({
    title: String,
    description: String,
    slugOfGearbox:String,
    gearbox:String,
    slugOfType:String,
    typeName:String,
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

