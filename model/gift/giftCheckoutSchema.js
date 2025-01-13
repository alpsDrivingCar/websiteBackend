const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const giftCheckoutSchema = new mongoose.Schema({
    cardId: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'gifts',
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
    },
    senderOTP: {
        type: String,
        required: true
    },
    deliverDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failure'],
        default: 'pending'
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['card', 'custom'],
        required: true
    },
    customGiftAmount: {
        type: Number,
        required: false
    }
},{
    timestamps:true
});

const GiftCheckout = mongoose.model('GiftCheckout', giftCheckoutSchema);

module.exports = GiftCheckout;
