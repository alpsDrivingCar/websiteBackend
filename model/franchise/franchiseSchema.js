const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const franchiseOpportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    benefits: {
        type: String,
        required: true
    },
    investmentDetails: [{
        type: String,
        required: true
    }],
    sections: [sectionSchema],
    contactUsTitle: {
        type: String,
        required: true
    },
    contactUsDescription: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
});

const FranchiseOpportunity = mongoose.model('FranchiseOpportunity', franchiseOpportunitySchema);

module.exports = FranchiseOpportunity;
