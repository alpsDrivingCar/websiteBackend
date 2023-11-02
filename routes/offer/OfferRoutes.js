const offerServer = require('../../Controller/offer/offerCotroller')
const express = require("express");
const router = express.Router();

router.get("/",offerServer.offers)
router.get("/by-id/:id",offerServer.offersById)
router.post("/",offerServer.createOffer)
router.delete("/:id",offerServer.deleteOffer)
router.put("/",offerServer.offerUpdate)

module.exports = router


