const mongoose = require('mongoose');

const giftCheckoutSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true,
        unique: true
    },
    deliverName: {
        type: String,
        required: true
    },
    deliverEmail: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    senderEmail: {
        type: String,
        required: true,
        unique: true
    },
    senderOTP: {
        type: String,
        required: true
    },
    deliverDate: {
        type: Date,
        required: true
    }
});

const GiftCheckout = mongoose.model('GiftCheckout', giftCheckoutSchema);

module.exports = GiftCheckout;
