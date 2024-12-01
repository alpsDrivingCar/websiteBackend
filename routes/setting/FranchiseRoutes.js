const franchiseServer = require('../../Controller/setting/franchiseCotroller')
const authenticateAdmin = require('../../Middleware/dashboardAdminAuth.js');

const express = require("express");
const router = express.Router();

router.get("/all", authenticateAdmin, franchiseServer.allFranchise)
router.get("/byId/:id",franchiseServer.getById)
router.post("/",franchiseServer.createFranchise)
router.delete("/:id", authenticateAdmin, franchiseServer.deleteFranchise)
router.put("/", authenticateAdmin, franchiseServer.franchiseUpdate)

module.exports = router


