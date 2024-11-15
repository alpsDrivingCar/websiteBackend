const paymentServer = require('../../../../Controller/booking/checkout/payment/paymentCotroller')
const updateOrderServer = require('../../../../Controller/booking/checkout/payment/updateOrder')
const express = require("express");
const router = express.Router();

router.post("/create/",paymentServer.createPaymentAndGetUrlPaymentNew)
router.get("/checkSession/:id",paymentServer.checkElavonSessionExpiry)
router.get("/all",paymentServer.allPayment)
router.get("/:id",paymentServer.getPayment)
router.put("/update/:id",updateOrderServer.updateSaveStatusAndChangedBy)
router.put("/updateOrderStatus/:id",updateOrderServer.updateOrderStatus)

module.exports = router


