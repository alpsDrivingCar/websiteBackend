const server = require('../../../Controller/booking/package/PackageBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/all",server.getBookingPackage)
router.post("/",server.createBookingPackage)
router.put("/",server.bookingPackageUpdate)
router.delete("/:id",server.deleteBookingPackage)


module.exports = router

