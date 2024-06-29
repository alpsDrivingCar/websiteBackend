const server = require('../../../Controller/booking/package/PackageBookingCotroller')
const express = require("express");
const router = express.Router();

router.get("/by-id/:id", server.getBookingPackageById)
router.get("/by-post-code", server.bookingPackageByPostCode)
router.get("/by-post-code-and-type", server.bookingPackageByPostCodeAndType)
router.post("/", server.createBookingPackage)
router.put("/:id", server.updateBookingPackage)
router.put("/:id/status", server.updateBookingPackageStatus)  
router.delete("/:id", server.deleteBookingPackage)
router.post("/slug-type", server.getPackagesBySlug)


module.exports = router

