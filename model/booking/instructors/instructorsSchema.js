const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingInstructorsSchema = new Schema({
    title: String,
    gearbox: [
        {
            slug: String,
            name: String,
            selected: { type: Boolean, default: false },
            package: [
                {
                    packageId: String,
                    numberHour: Number,
                    total: Number,
                    totalBeforeSale: { type: Number, default: "100" },
                    numberOfLessons: Number,
                    saveUp: { type: String, default: "Save Up To 20% !" },
                    priceSave: { type: String, default: "Save £50" },
                    // Set by formatDataForBooking. Must stay declared here: the booking
                    // response is built by instantiating this model, so an undeclared
                    // field is stripped silently and the API answers 200 without it.
                    hasIntensiveCoverage: { type: Boolean, default: false },
                    // Mirrors slugOfType on the package document. Left as a plain String
                    // with no enum: this is a read-only view of the packages collection,
                    // so a new type added there must flow through, not fail here.
                    slugOfType: String,

                }
            ]
        }
    ]
});
// Create a model based on that schema
const BookingInstructors = mongoose.model("bookingInstructors", bookingInstructorsSchema);

module.exports = BookingInstructors

