const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testBookingRequestSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^(?:0|\+?44)(?:\d\s?){9,10}$/, 'Please enter a valid UK phone number']
    },
    postcode: {
        type: String,
        required: true
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt timestamps
});

// Create a model based on that schema
const TestBookingRequest = mongoose.model('TestBookingRequest', testBookingRequestSchema);

module.exports = TestBookingRequest;
