const paymentServer = require('../../../../Controller/booking/checkout/payment/paymentCotroller')
const express = require("express");
const router = express.Router();

router.post("/",paymentServer.createPaymentAndGetUrlPayment)
router.get("/all",paymentServer.allPayment)
router.get("/:id",paymentServer.getPayment)
router.put("/:id",paymentServer.updateSaveStatusAndChangedBy)

module.exports = router

