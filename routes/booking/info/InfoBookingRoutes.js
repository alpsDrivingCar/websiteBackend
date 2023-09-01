const server = require('../../../Controller/booking/info/InfoBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/",server.getBookingInfo)
router.get("/:id",server.bookingInfoByPostCode)
router.post("/",server.createBookingInfo)
router.put("/",server.bookingInfoUpdate)
router.delete("/:id",server.deleteBookingInfo)


module.exports = router

