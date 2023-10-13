const paymentServer = require('../../../../Controller/booking/checkout/payment/paymentCotroller')
const express = require("express");
const router = express.Router();

router.post("/",paymentServer.payment)
router.get("/all",paymentServer.allPayment)

module.exports = router


