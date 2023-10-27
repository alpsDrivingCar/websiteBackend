const testBookingServer = require('../../../Controller/booking/testBooking/testBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/",testBookingServer.testBookings)
router.get("/instructors",testBookingServer.testBookingByInstructors)
router.post("/",testBookingServer.createTestBooking)
router.delete("/:id",testBookingServer.deleteTestBooking)

module.exports = router


