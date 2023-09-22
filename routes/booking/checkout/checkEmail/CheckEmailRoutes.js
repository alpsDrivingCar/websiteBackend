const checkEmailServer = require('../../../../Controller/booking/checkout/checkEmail/sendEmail')
const express = require("express");
const router = express.Router();

router.post("/",checkEmailServer.sendEmailForChechEmailValid)

module.exports = router


