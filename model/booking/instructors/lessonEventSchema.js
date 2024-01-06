const mongoose = require('mongoose');

const lessonEventSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date, // Changed from String to Date
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: true,
    }
});

const LessonEvent = mongoose.model('LessonEvent', lessonEventSchema);

module.exports = LessonEvent;
