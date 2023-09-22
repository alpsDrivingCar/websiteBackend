const timeLessonServer = require('../../../Controller/booking/timeLesson/timeLessonCotroller')
const express = require("express");
const router = express.Router();

router.get("/",timeLessonServer.timeLessons)
router.get("/instructors",timeLessonServer.timeLessonByInstructors)
router.post("/",timeLessonServer.createTimeLesson)
router.delete("/:id",timeLessonServer.deleteTimeLesson)

module.exports = router


