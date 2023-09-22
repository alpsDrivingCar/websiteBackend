const paymentServer = require('../../../../Controller/booking/checkout/payment/paymentCotroller')
const express = require("express");
const router = express.Router();

router.post("/",paymentServer.payment)

module.exports = router


