const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestBookingSchema = new Schema({
    termsConditions: String
});


const TestBooking = mongoose.model("testBookings", TestBookingSchema);

module.exports = TestBooking

