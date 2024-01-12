// const TimeLessonSchema = require("../../../model/booking/timeLesson/timeLessonSchema");

exports.validateUKPostcode = (req, res) => {
    const postcode = req.query.postcode;

    // Regex pattern for UK postcode validation
    const regexPattern = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;

    // Check if the postcode matches the pattern
    if (regexPattern.test(postcode)) {
        res.status(204).send(); // Send 204 No Content when postcode is valid
    } else {
        res.status(400).json({ valid: false, message: 'Invalid UK postcode.' });
    }
};


