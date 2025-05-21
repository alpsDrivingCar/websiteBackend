const postcodeController = require('../../../Controller/booking/postcode/postcodeCotroller');
const authenticateAdmin = require('../../../Middleware/dashboardAdminAuth.js');
const express = require("express");
const router = express.Router();

// Assuming you want the endpoint to be '/validate-postcode'
router.get("/validate-postcode", postcodeController.validateUKPostcode);
router.get("/postcode-gearbox-our-instructors", postcodeController.getPostCodeAndGearboxOfOurInstructors);
router.get('/top-searches', authenticateAdmin,postcodeController.getTopSearchedPostcodes);
router.get('/covered-cities', postcodeController.getCoveredCitiesFromLocations);


module.exports = router;
