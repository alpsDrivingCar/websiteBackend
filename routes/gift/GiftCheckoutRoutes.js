const giftServer = require('../../Controller/gift/cards/giftPaymentCotroller')
const authenticateAdmin = require('../../Middleware/dashboardAdminAuth.js');
const express = require("express");
const router = express.Router();

router.post("/create",giftServer.createPaymentAndGetUrlPaymentForGiftNew)
router.post("/validateOTP", giftServer.validateOTP);

router.get('/all', authenticateAdmin, giftServer.getAllCheckoutInfos);
router.get('/:id', authenticateAdmin, giftServer.getCheckoutInfoById);
router.put('/:id', giftServer.updateCheckoutInfo);

module.exports = router

