const paymentServer = require('../../../../Controller/booking/checkout/payment/paymentCotroller')
const express = require("express");
const router = express.Router();

router.post("/create/",paymentServer.createPaymentAndGetUrlPayment)
router.get("/all",paymentServer.allPayment)
router.get("/:id",paymentServer.getPayment)
router.put("/update/:id",paymentServer.updateSaveStatusAndChangedBy)
router.put("/updateOrderStatus/:id",paymentServer.updateOrderStatus)

module.exports = router


