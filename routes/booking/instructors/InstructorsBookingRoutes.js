const server = require('../../../Controller/booking/instructors/InstructorsBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/all",server.getBookingInstructors)
router.post("/",server.createBookingInstructors)
router.put("/",server.bookingInstructorsUpdate)
router.delete("/:id",server.deleteBookingInstructors)
router.get("/",server.instructorsByPostcodeAndtype)


module.exports = router

