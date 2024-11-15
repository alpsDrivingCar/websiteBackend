const giftServer = require('../../Controller/gift/cards/giftPaymentCotroller')
const express = require("express");
const router = express.Router();

router.post("/create",giftServer.createPaymentAndGetUrlPaymentForGiftNew)
router.post("/validateOTP", giftServer.validateOTP);

router.get('/all', giftServer.getAllCheckoutInfos);
router.get('/:id', giftServer.getCheckoutInfoById);
router.put('/:id', giftServer.updateCheckoutInfo);

module.exports = router

