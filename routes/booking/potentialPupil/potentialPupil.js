const potentialPupilController = require('../../../Controller/booking/potentialPupils/potentialPupilController');
const express = require("express");
const router = express.Router();

router.post("/", potentialPupilController.storePotentialPupil)

module.exports = router