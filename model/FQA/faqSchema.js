const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    faqs: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }],
    contactTitle: {
        type: String,
        required: true
    },
    contactDescription: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
