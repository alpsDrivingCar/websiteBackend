const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testBookingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false, // Assuming the image URL is optional
  },
  contactSectionData: {
    phoneNumber:  String,
    whatsNumber: String
  },
}, {
  timestamps: true
});

// Create a model based on that schema
const TestBooking = mongoose.model('TestBookingInfo', testBookingSchema);

module.exports = TestBooking;