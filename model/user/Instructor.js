const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            min: 3,
            max: 20,
        },
        userType: {
            type: String,
            default: "instructor"
        },
        lastName: {
            type: String,
            required: true,
            min: 3,
            max: 20,
        },
        trainers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Trainee'
            },
        ],
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
        carReg: {
            type: String,
            default: '',
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
        AcceptFemaleStudent: {
            type: Boolean,
            default: false,
        },
        availableAreas: [{
            postcode: {
              type: String,
              required: true
            },
            days: [{
              type: String,
              enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All Days']
            }]
        }],
        travelingTime: {
            type: String,
        },
        roles: {
            type: Array,
        },
        isPotential: {
            type: Boolean,
            default: false,
        },
        instructorLevel: {
            type: String,
            default: "part2",// "part3" , part2
        },
        instructorRole: {
            type: String,
            enum: ['instructor', 'instructor-trainer'],
            default: 'instructor',
        },
        notificationStatus: {
            type: String,
            enum: ['enableEmail', 'disableEmail'], // Corrected the typo here
            default: "enableEmail",
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        gearbox: {
            type: String,
            enum: ['automatic', 'manual', 'electric', 'electric & manual', 'automatic & manual', 'electric & automatic', 'unknown'],
            required: true,
            default: 'manual',
        },
        profileImage: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        carModel: {
            type: String,
            default: ""
        },
        workingHours: {
            Monday: {
              open: { type: String },  // stored in 24-hour format
              close: { type: String }
            },
            Tuesday: {
              open: { type: String },
              close: { type: String }
            },
            Wednesday: {
              open: { type: String },
              close: { type: String }
            },
            Thursday: {
              open: { type: String },
              close: { type: String }
            },
            Friday: {
              open: { type: String },
              close: { type: String }
            },
            Saturday: {
              open: { type: String },
              close: { type: String }
            },
            Sunday: {
              open: { type: String },
              close: { type: String }
            }
          },
          
          lunchBreak: {
            start: { type: String },
            end: { type: String }
          },
    },

    {
        timestamps: true,
    }
);


const Instructor = mongoose.model("Instructors", InstructorSchema);

module.exports = Instructor
