const lessonServer = require('../../../Controller/booking/lesson/lessonCotroller')
const express = require("express");
const router = express.Router();

router.get("/",lessonServer.lessons)
router.get("/:id",lessonServer.lessonByPostCode)
router.post("/",lessonServer.createLesson)
router.delete("/:id",lessonServer.deleteLesson)

module.exports = router

module.exports = router

