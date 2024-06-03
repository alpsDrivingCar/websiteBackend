const mongoose = require('mongoose');


const notificationReplacementSchema = new mongoose.Schema({
    pupilName: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    time: {
        type: String,
        required: false,
    },
    lessonType: {
        type: String,
        required: false,
    },
    contactUsType: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: false,
    },
    websiteType: {
        type: String,
        required: false,
    },
},{
    timestamps:true
});

const notificationSchema = new mongoose.Schema({
    pageDirected :{
        id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        slug: {
            type: String
        }
    },
    notificationTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NotificationTemplate",
        required: true,
    },
    replacement: {
        type: notificationReplacementSchema,
        required: false
    },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'userType' // Points to the field that contains the model name
        },
        userType: {
            type: String,
            required: true,
            enum: ['Trainee', 'Pupil', 'Instructor', 'Admin', 'AllAdmin'] // Ensure this matches your model names
        }
    },
    status: {
        type: String,
        required: false,
        enum: ['seen', 'not-seen'], // Restricts the value to either 'seen' or 'not seen'
        default: 'not-seen' // Default status indicating the notification has not been seen
    },
    seenBy: {
        type: String,
        required: false
    },
}, {
    timestamps: true  // Adds createdAt and updatedAt timestamps
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
