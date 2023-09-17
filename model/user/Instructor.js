const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            min: 3,
            max: 20,
        },
        lastName: {
            type: String,
            required: true,
            min: 3,
            max: 20,
        },
        middleName: {
            type: String,
            min: 3,
            max: 20,
        },
        gender: {
            type: Number,
            enum: [0, 1, 2],
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },

        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        city: {
            type: String,
        },
        county: {
            type: String,
        },
        postCode: {
            type: String,
        },
        drivingLicencesNo: {
            type: String,
        },
        ADINo: {
            type: String,
        },
        address: {
            type: String,
        },
        streetName: {
            type: String,
        },
        ADILicencesStartingDate: {
            type: String,
        },
        ADILicencesExpiryDate: {
            type: String,
        },
        locationBased: {
            type: String,
        },
        areasCovered: {
            type: String,
        },
        privateNotes: {
            type: String,
        },
        hearAboutUs: {
            type: String,
        },
        pointsOnLicence: {
            type: String,
        },
        heldUkLicence: {
            type: String,
        },
        contractStartDate: {
            type: String,
        },
        contractExpiryDate: {
            type: String,
        },
        trainerLicencesStartingDate: {
            type: String,
        },
        trainerLicenceExpiryDate: {
            type: String,
        },
        complaints: {
            type: String,
        },
        probationPeriod: {
            type: String,
        },
        referrals: {
            type: String,
        },
        DBSCheckDate: {
            type: String,
        },
        p1PassDate: {
            type: String,
        },
        p2PassDate: {
            type: String,
        },
        p3PassDate: {
            type: String,
        },
        p2TrainingHours: {
            type: String,
        },
        p3TrainingHours: {
            type: String,
        },
        standardCheckTrainingHours: {
            type: String,
        },
        standardCheckPassDate: {
            type: String,
        },
        extraQualification: {
            type: String,
        },
        languageSpoken: {
            type: String,
        },
        jobHours: {
            type: String,
        },
        gapsInBetweenLessons: {
            type: String,
        },
        dualControls: {
            type: String,
        },
        carWrapping: {
            type: String,
        },
        loans: {
            type: String,
        },
        startPaymentDate: {
            type: String,
        },
        endPaymentDate: {
            type: String,
        },
        trainerExperience: {
            type: String,
        },
        trainerPassRate: {
            type: String,
        },
        dateOfBirth: {
            type: String,
        },
        PDIimage: {
            type: Array,
        },
        PDIFile: {
            type: Array,
        },

        amountRequired: {
            type: Number,
        },
        amountPaid: {
            type: Number,
        },
        totalAmount: {
            type: Number,
        },
        percentage: {
            type: Number,
            required: true,
            default: 0,
        },
        numOfHours: {
            type: Number,
        },
        hourlyCost: {
            type: Number,
        },
        areas: {
            type: Array,
            default: [],
        },
        AcceptStudent: {
            type: Boolean,
            default: false,
        },
        travelingTime: {
            type: String,
        },
        password: {
            type: String,
        },
        roles: {
            type: Array,
        },
        isPotential: {
            type: Boolean,
            default: false,
        },
    },

    {
        timestamps: true,
    }
);


const Instructor = mongoose.model("Instructors", InstructorSchema);

module.exports = Instructor
