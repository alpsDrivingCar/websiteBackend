const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const bookingInstructorsSchema = new Schema({
    title: String,
    gearbox: [
        {
            slug: String,
            name: String,
            instructors: [
                {
                    name: String,
                    priceHour: Number,
                    package: [
                        {
                            numberHour: Number,
                            total :Number
                        }
                    ]
                }
            ]

        }
    ]
});


// Create a model based on that schema
const BookingInstructors = mongoose.model("bookingInstructors", bookingInstructorsSchema);

module.exports = BookingInstructors

