const contactusServer = require('../../Controller/setting/contactusCotroller')
const authenticateAdmin = require('../../Middleware/dashboardAdminAuth.js');

const express = require("express");
const router = express.Router();

router.get("/", authenticateAdmin, contactusServer.contactuss)
router.post("/",contactusServer.createContactus)
router.delete("/:id", authenticateAdmin, contactusServer.deleteContactus)
router.put("/", authenticateAdmin, contactusServer.contactusUpdate)
router.get("/all/", authenticateAdmin, contactusServer.getAllContactUs);
router.get("/:id", authenticateAdmin, contactusServer.getContactUsById);


module.exports = router

