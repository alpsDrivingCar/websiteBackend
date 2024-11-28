const joinusServer = require('../../Controller/setting/joinus')
const authenticateAdmin = require('../../Middleware/dashboardAdminAuth.js');

const express = require("express");
const router = express.Router();

router.get("/", authenticateAdmin, joinusServer.joinusUpdate)
router.get("/all", authenticateAdmin, joinusServer.joinus)
router.get("/:id", authenticateAdmin, joinusServer.joinusById)
router.post("/", joinusServer.createJoinus)
router.delete("/:id", authenticateAdmin, joinusServer.deleteJoinus)
router.put("/", authenticateAdmin, joinusServer.joinusUpdate)

module.exports = router


