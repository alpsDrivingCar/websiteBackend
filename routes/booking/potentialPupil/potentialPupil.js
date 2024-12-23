const potentialPupilController = require('../../../Controller/booking/potentialPupils/potentialPupilController');
const express = require("express");
const router = express.Router();

router.get("/", potentialPupilController.getPotentialPupils)
router.post("/", potentialPupilController.storePotentialPupil)

module.exports = router