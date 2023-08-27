const contactUsServer = require('../../Controller/setting/contactUs')
const express = require("express");
const router = express.Router();

router.get("/",contactUsServer.contactUs)
router.post("/",contactUsServer.createContactUs)
router.delete("/:id",contactUsServer.deleteContactUs)
router.put("/",contactUsServer.contactUsUpdate)

module.exports = router


