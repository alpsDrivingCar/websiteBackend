const giftServer = require('../../Controller/gift/cards/giftPaymentCotroller')
const express = require("express");
const router = express.Router();

router.post("/create",giftServer.createPaymentAndGetUrlPaymentForGift)

router.get('/all', giftServer.getAllCheckoutInfos);
router.get('/:id', giftServer.getCheckoutInfoById);
router.put('/:id', giftServer.updateCheckoutInfo);

module.exports = router

