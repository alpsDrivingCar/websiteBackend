const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TimeSlotSchema = new Schema({
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
});

const DaySchema = new Schema({
    day: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    month: {
        type: String,
        required: true,
    },
    availableTimes: {
        type: [TimeSlotSchema],
        required: true,
    },
});

const TimeLessonSchema = new Schema({
    days: {
        type: [DaySchema],
        required: true,
    },
});


const TimeLesson = mongoose.model("timeLessons", TimeLessonSchema);

module.exports = TimeLesson

