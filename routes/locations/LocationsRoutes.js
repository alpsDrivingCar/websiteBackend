const locationsServer = require('../../Controller/locations/locationsCotroller')
const express = require("express");
const router = express.Router();

router.get("/all",locationsServer.locationss)
// router.get("/:id",locationsServer.locationsByPostCode)
router.post("/",locationsServer.createLocations)
router.delete("/:id",locationsServer.deleteLocations)
router.put("/",locationsServer.locationsUpdate)

//handle locations shown on website
router.get("/location",locationsServer.getLocations) //get all locations and location by id
router.post("/location/add",locationsServer.addLocations) //add location
router.put("/location/:locationId",locationsServer.updateLocation) //update location
router.delete("/location/:locationId",locationsServer.deleteLocation) //delete location


module.exports = router

