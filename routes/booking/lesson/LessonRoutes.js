const lessonServer = require('../../../Controller/booking/lesson/lessonCotroller')
const express = require("express");
const router = express.Router();

router.get("/",lessonServer.lessons)
router.get("/post-code/",lessonServer.lessonByPostCode)
router.post("/",lessonServer.createLesson)
router.put("/:id",lessonServer.lessonUpdate)
router.delete("/:id",lessonServer.deleteLesson)



module.exports = router

