const homeServer = require('../../Controller/home/homeCotroller')
const express = require("express");
const router = express.Router();

router.get("/",homeServer.homes)
// router.get("/:id",homeServer.homeByPostCode)
router.post("/",homeServer.createHome)
router.delete("/:id",homeServer.deleteHome)

module.exports = router

module.exports = router

