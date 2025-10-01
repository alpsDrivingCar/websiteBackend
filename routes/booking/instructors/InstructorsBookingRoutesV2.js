const server = require('../../../Controller/booking/instructors/InstructorsBookingCotroller')
const authenticateAdmin = require('../../../Middleware/dashboardAdminAuth.js');
const express = require("express");
const router = express.Router();

router.get("/instructors/availableTimeSlots",server.availableTimeSlotsV2)
router.get("/instructors/admin/availableInstructors",authenticateAdmin,server.getAvailableInstructorsForAdmin)


module.exports = router

