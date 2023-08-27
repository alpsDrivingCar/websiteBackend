const joinusServer = require('../../Controller/setting/joinus')
const express = require("express");
const router = express.Router();

router.get("/",joinusServer.joinusUpdate)
router.post("/",joinusServer.createJoinus)
router.delete("/:id",joinusServer.deleteJoinus)
router.put("/",joinusServer.joinusUpdate)

module.exports = router


