const gmyServer = require('../Controller/gymCotroller')
const express = require("express");
const router = express.Router();

router.get("/",gmyServer.gyms)
router.get("/:id",gmyServer.gymById)
router.post("/",gmyServer.createGym)
router.delete("/:id",gmyServer.deleteGym)
router.put("/:id",gmyServer.gymUpdate)

module.exports = router

