const server = require('../../../Controller/booking/package/PackageBookingCotroller')
const authenticateAdmin = require('../../../Middleware/dashboardAdminAuth')
const express = require("express");
const router = express.Router();

router.get("/by-id/:id", authenticateAdmin,server.getBookingPackageById)
router.get("/by-post-code", authenticateAdmin,server.bookingPackageByPostCode)
router.get("/by-post-code-and-type", authenticateAdmin,server.bookingPackageByPostCodeAndType)
router.get("/mock-test-offer", server.getMockTestBookingPackage)
router.post("/", authenticateAdmin,server.createBookingPackage)
router.put("/:id", authenticateAdmin,server.updateBookingPackage)
router.put("/:id/status", authenticateAdmin,server.updateBookingPackageStatus)  
router.delete("/:id", authenticateAdmin,server.deleteBookingPackage)
router.post("/slug-type", authenticateAdmin,server.getPackagesBySlug)


module.exports = router

