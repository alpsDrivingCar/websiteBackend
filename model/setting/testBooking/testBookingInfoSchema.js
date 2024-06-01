const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSectionSchema = new Schema({
  content:String,
  phoneNumber: {
    type: String,
    required: true,
  },
  whatsNumber: {
    type: String,
    required: true,
  }
}, { _id : false }); // Disabling _id for subdocuments


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
    type: contactSectionSchema,
    required: true,
  },
}, {
  timestamps: true
});

// Create a model based on that schema
const TestBooking = mongoose.model('TestBookingInfo', testBookingSchema);

module.exports = TestBooking;