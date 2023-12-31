const timeLessonServer = require('../../../Controller/booking/timeLesson/timeLessonCotroller')
const express = require("express");
const router = express.Router();

router.get("/",timeLessonServer.timeLessons)
router.get("/un-available-time",timeLessonServer.unAvailableTimeLesson)
router.post("/",timeLessonServer.createTimeLesson)
router.delete("/:id",timeLessonServer.deleteTimeLesson)
router.put("/:id",timeLessonServer.timeLessonUpdate)

module.exports = router


