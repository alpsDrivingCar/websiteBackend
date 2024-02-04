const contactusServer = require('../../Controller/setting/contactusCotroller')
const express = require("express");
const router = express.Router();

router.get("/",contactusServer.contactuss)
router.post("/",contactusServer.createContactus)
router.delete("/:id",contactusServer.deleteContactus)
router.put("/",contactusServer.contactusUpdate)
router.get("/all/", contactusServer.getAllContactUs);
router.get("/:id", contactusServer.getContactUsById);


module.exports = router

