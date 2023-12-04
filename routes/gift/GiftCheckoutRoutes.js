const giftServer = require('../../Controller/gift/giftPaymentCotroller')
const express = require("express");
const router = express.Router();

router.post("/create",giftServer.createPaymentAndGetUrlPaymentForGift)

module.exports = router

