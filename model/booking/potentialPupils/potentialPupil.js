const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const potentialPupilSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    problem: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        required: false,
        default: false,
    },
}, {
    timestamps: true  // Adds createdAt and updatedAt timestamps
});

const PotentialPupil = mongoose.model('PotentialPupil', potentialPupilSchema);

module.exports = PotentialPupil;