const TimeLessonSchema = require("../../../model/booking/timeLesson/timeLessonSchema");

exports.createTimeLesson = (req, res) => {
    const timeLessonSchema = new TimeLessonSchema(req.body);

    console.log(req.body);
    timeLessonSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.timeLessons = (req, res) => {
    // result = Array of objects inside mongo database
    TimeLessonSchema.find()
        .then((result) => {
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.timeLessonByInstructors = (req, res) => {
    // result =   object  inside mongo database
    // TimeLessonSchema.findById(req.params.id)
    TimeLessonSchema.findById("64b7fc5711f03424354f4ac5")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.timeLessonUpdate = (req, res) => {
    // result =   object  inside mongo database
    TimeLessonSchema.findByIdAndUpdate(req.params.id).updateOne(req.body)
        .then((result) => {
            res.send("Update " + result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteTimeLesson = (req, res) => {
    TimeLessonSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
