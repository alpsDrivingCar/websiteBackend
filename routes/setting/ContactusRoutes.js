const contactusServer = require('../../Controller/setting/contactusCotroller')
const express = require("express");
const router = express.Router();

router.get("/",contactusServer.contactuss)
// router.get("/:id",contactusServer.contactusByPostCode)
router.post("/",contactusServer.createContactus)
router.delete("/:id",contactusServer.deleteContactus)
router.put("/",contactusServer.contactusUpdate)


module.exports = router

