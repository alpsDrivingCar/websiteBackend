const paymentServer = require('../../../../Controller/booking/checkout/payment/paymentCotroller')
const updateOrderServer = require('../../../../Controller/booking/checkout/payment/updateOrder')
const authenticateAdmin = require('../../../../Middleware/dashboardAdminAuth.js');

const express = require("express");
const router = express.Router();

router.post("/create/",paymentServer.createPaymentAndGetUrlPaymentNew)
router.get("/checkSession/:id",paymentServer.checkElavonSessionExpiry)
router.get("/all", authenticateAdmin, paymentServer.allPayment)
router.get("/:id", authenticateAdmin, paymentServer.getPayment)
router.put("/update/:id", authenticateAdmin, updateOrderServer.updateSaveStatusAndChangedBy)
router.put("/updateOrderStatus/:id",updateOrderServer.updateOrderStatus)

module.exports = router


