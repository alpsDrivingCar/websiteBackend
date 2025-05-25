const server = require('../../../Controller/booking/instructors/InstructorsBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/instructors/availableTimeSlots",server.availableTimeSlotsV2)


module.exports = router

