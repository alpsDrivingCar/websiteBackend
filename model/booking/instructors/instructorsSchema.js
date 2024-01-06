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
                    numberOfLessons: Number,
                    saveUp: { type: String, default: "Save Up To 20% !" },
                    priceSave: { type: String, default: "Save £50" },

                }
            ]
        }
    ]
});
// Create a model based on that schema
const BookingInstructors = mongoose.model("bookingInstructors", bookingInstructorsSchema);

module.exports = BookingInstructors

