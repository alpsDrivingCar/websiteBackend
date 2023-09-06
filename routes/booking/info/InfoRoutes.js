const infoServer = require('../../../Controller/booking/info/infoCotroller')
const express = require("express");
const router = express.Router();

router.get("/",infoServer.infos)
router.get("/:id",infoServer.infoByPostCode)
router.post("/",infoServer.createInfo)
router.delete("/:id",infoServer.deleteInfo)


module.exports = router

