const postcodeController = require('../../../Controller/booking/postcode/postcodeCotroller');
const express = require("express");
const router = express.Router();

// Assuming you want the endpoint to be '/validate-postcode'
router.get("/validate-postcode", postcodeController.validateUKPostcode);

module.exports = router;