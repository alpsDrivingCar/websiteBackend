const giftServer = require('../../Controller/gift/giftCotroller')
const express = require("express");
const router = express.Router();

router.get("/all",giftServer.gifts)
router.post("/",giftServer.createGift)
router.delete("/:id",giftServer.deleteGift)
router.put("/",giftServer.giftUpdate)


module.exports = router

