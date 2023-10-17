const server = require('../../../Controller/booking/package/PackageBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/all",server.getBookingPackage)
router.get("/by-post-code",server.bookingPackageByPostCode)
router.post("/",server.createBookingPackage)
router.put("/:id",server.updateBookingPackage)
router.delete("/:id",server.deleteBookingPackage)
router.get("/slug-type",server.getPackagesBySlug)


module.exports = router

