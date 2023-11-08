const locationsServer = require('../../Controller/locations/locationsCotroller')
const express = require("express");
const router = express.Router();

router.get("/all",locationsServer.locationss)
// router.get("/:id",locationsServer.locationsByPostCode)
router.post("/",locationsServer.createLocations)
router.delete("/:id",locationsServer.deleteLocations)
router.put("/",locationsServer.locationsUpdate)


module.exports = router

