const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
    lessonNumber: { type: String, required: true },
    reservationCode: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true }, // format "HH:mm-HH:mm"
    price: { type: Number, required: true },
    status: { type: String, enum: ['Done', 'Still', 'Canceled'], required: true }
});

const bookingDetailSchema = new Schema({
    numberOfLessons: { type: String, required: true }, // "3 Lesson" in the example
    testBooking: { type: String, enum: ['Yes', 'No'], required: true },
    postCode: { type: String, required: true },
    price: { type: Number, required: true },
    instructor: {
        name: { type: String, required: true },
        initials: { type: String, required: true }, // "OB" in the example
    },
    lessons: [lessonSchema] // Embed the lesson schema as an array
});

const BookingDetail = mongoose.model('BookingDetail', bookingDetailSchema);

module.exports = BookingDetail;
