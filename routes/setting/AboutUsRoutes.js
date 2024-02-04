const aboutusServer = require('../../Controller/setting/aboutUsCotroller')
const express = require("express");
const router = express.Router();

router.get("/",aboutusServer.aboutus)
router.post("/",aboutusServer.createAboutus)
router.delete("/:id",aboutusServer.deleteAboutus)
router.put("/",aboutusServer.aboutusUpdate)
router.get('/:id', aboutusServer.getAboutById);


module.exports = router


