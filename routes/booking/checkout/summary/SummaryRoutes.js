const summaryServer = require('../../../../Controller/booking/checkout/summary/summaryController')
const express = require("express");
const router = express.Router();

router.get("/pupil/", summaryServer.getBookingDetails);


module.exports = router


