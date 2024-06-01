const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingPackageSchema = new Schema({
    title: String,
    description: String,
    slugOfGearbox: String,
    gearbox: String,
    slugOfType: {
        type: String,
        enum: [
            "our_offers_packages",
            "standard_packages",
            "intensive_courses",
            "refresher_lessons",
            "pass_plus_course",
            "tesla_model_y_courses"
        ],
        required: true
    },
    typeName: String,
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
    features: [
        {
            feature: String,
        }
    ]
},{
  timestamps: true  // Adds createdAt and updatedAt timestamps
});


// Create a model based on that schema
const BookingPackage = mongoose.model("bookingPackage", bookingPackageSchema);

module.exports = BookingPackage

