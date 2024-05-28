const giftServer = require('../../Controller/gift/info/giftInfoCotroller')
const express = require("express");
const router = express.Router();

router.get("/",giftServer.gifts)
router.get("/byId",giftServer.getGiftId)
router.post("/",giftServer.createGift)
router.delete("/:id",giftServer.deleteGift)
router.put("/",giftServer.giftUpdate)


module.exports = router

