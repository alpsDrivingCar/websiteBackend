const server = require('../../../Controller/booking/instructors/InstructorsBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/all",server.getBookingInstructors)
router.post("/",server.createBookingInstructors)
router.put("/",server.bookingInstructorsUpdate)
router.delete("/:id",server.deleteBookingInstructors)
router.get("/packages",server.getBookingPackagesByPostcodeAndtype)
router.get("/instructors",server.instructorsByPostcodeAndAvailableTimeAndGearBox)
router.get("/instructors/availableTimeSlots",server.availableTimeSlots)
router.get("/instructors/availableGapTimeSlots",server.availableGapTimeSlots)


module.exports = router

