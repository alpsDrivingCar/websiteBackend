const franchiseServer = require('../../Controller/setting/franchiseCotroller')
const express = require("express");
const router = express.Router();

router.get("/",franchiseServer.franchise)
router.post("/",franchiseServer.createFranchise)
router.delete("/:id",franchiseServer.deleteFranchise)
router.put("/",franchiseServer.franchiseUpdate)

module.exports = router


