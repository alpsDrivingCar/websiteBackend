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
    benefits: [{
        type: String,
        required: true
    }],
    investmentDetails: [{
        type: String,
        required: true
    }],
    sections: [sectionSchema]
}, {
    timestamps: true,
});

const FranchiseOpportunity = mongoose.model('FranchiseOpportunity', franchiseOpportunitySchema);

module.exports = FranchiseOpportunity;
