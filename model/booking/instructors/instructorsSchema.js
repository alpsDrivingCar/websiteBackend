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
                    totalBeforeSale: Number,
                    numberOfLessons: Number  // New field added
                }
            ],
            instructors: [
                {
                    name: String,
                    priceHour: Number
                }
            ]
        }
    ]
});
// Create a model based on that schema
const BookingInstructors = mongoose.model("bookingInstructors", bookingInstructorsSchema);

module.exports = BookingInstructors

