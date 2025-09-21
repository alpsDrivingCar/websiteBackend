const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    eventType: {
        type: String,
        required: true,
        enum: ['Lesson', 'Away', 'Gap']
    },
    // Shared fields
    date: {
        type: Date,
        required: true
    },
    instructorId: {
        type: Schema.Types.ObjectId,
        ref: "Instructor",
        required: true,
    },
    trainerId: {
        type: Schema.Types.ObjectId,
    },
    color: {
        type: String,
        // required if needed
    },
    privateNotes: {
        type: String,
        // required if needed
    },

    // Fields specific to Lesson events
    pupilId: {
        type: Schema.Types.ObjectId,
        ref: 'Pupil',
        required: function() { return this.eventType === 'Lesson'; }
    },
    startTime: {
        type: Date,
        required: function() {
            return this.eventType === 'Lesson' || (this.eventType === 'Away' && this.awayType === 'PART_OF_DAY');
        }
    },
    endTime: {
        type: Date,
        required: function() {
            return this.eventType === 'Lesson' || (this.eventType === 'Away' && this.awayType === 'PART_OF_DAY');
        }
    },
    durationMinutes: {
        type: Number,
        required: function() { return this.eventType === 'Lesson'; }
    },
    gearbox: {
        type: String,
        enum: ['automatic', 'manual', 'electric'],
        required: function() { return this.eventType === 'Lesson'; }
    },
    lessonType: {
        type: String,
        required: function() { return this.eventType === 'Lesson'; }
    },
    pickUpLocation: {
        type: String,
    },
    dropOffLocation: {
        type: String,
    },
    repeatLesson: {
        type: String,
    },
    lessonSummary: {
        type: String,
    },
    awayType: {
        type: String,
        enum: ['ALL_DAY', 'PART_OF_DAY', 'WORKING_HOURS_MORNING', 'WORKING_HOURS_EVENING', 'LUNCH_BREAK'],
        required: function() { return this.eventType === 'Away'; }
    },
    isTraveling: {
        type: Boolean,
    },

    creatorId: {
        type: Schema.Types.ObjectId,
        // required if needed
    },
    creatorType: {
        type: String,
        required: function() { return this.eventType === 'Lesson'; },
        enum: ['admin', 'instructor']  // Only allows 'admin' or 'instructor' as values
    },
    Subject: {
        type: String,
        required:true
    },
    location: {
        type: String,
        // required if needed
    },
}, {
    timestamps: true  // Adds createdAt and updatedAt timestamps
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
