const server = require('../../../Controller/booking/instructors/InstructorsBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/",server.getBookingInstructors)
router.get("/:id",server.bookingInstructorsByPostCode)
router.post("/",server.createBookingInstructors)
router.put("/",server.bookingInstructorsUpdate)
router.delete("/:id",server.deleteBookingInstructors)


module.exports = router

