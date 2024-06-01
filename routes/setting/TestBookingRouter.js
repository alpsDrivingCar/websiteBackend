const testBookingController = require('../../Controller/setting/testBookingCotroller');
const express = require("express");
const router = express.Router();

// router.get("/all", testBookingController.getAllTestBookings);
// router.get("/byId/:id", testBookingController.getTestBookingById);
router.get("/info/", testBookingController.getTestBookingById);
router.post("/info/", testBookingController.createTestBooking);
router.delete("/info/:id", testBookingController.deleteTestBooking);
router.put("/info/:id", testBookingController.updateTestBooking);

// Request
const testBookingRequestController = require('../../Controller/setting/testBookingCotroller');

router.post('/request/', testBookingRequestController.createTestBookingRequest);
router.get('/request/all', testBookingRequestController.getAllTestBookingRequests);
router.get('/request/byId/:id', testBookingRequestController.getTestBookingRequestById);
router.put('/request/:id', testBookingRequestController.updateTestBookingRequest);
router.delete('/request/:id', testBookingRequestController.deleteTestBookingRequest);

module.exports = router;
