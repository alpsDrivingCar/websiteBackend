const LessonSchema = require("../../../model/booking/lesson/lessonSchema");
const InstructorsUserSchema = require("../../../model/user/Instructor");

exports.createLesson = (req, res) => {
    const lessonSchema = new LessonSchema(req.body);

    console.log(req.body);
    lessonSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.lessons = (req, res) => {
    // result = Array of objects inside mongo database
    LessonSchema.find()
        .then((result) => {
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.lessonByPostCode = (req, res) => {
    const {postCode} = req.params;

    console.log(postCode)

    const filter = {
        "postCode": { $regex: new RegExp("^" + postCode, "i") }
    };

    InstructorsUserSchema.find(filter)
        .then((result) => {
            if (result.length === 0) {
                return res.status(404).json({message: 'Data not found for the specified postcode.'});
            }
        })
        .catch((err) => {
            console.log(err);
        });

    LessonSchema.findById("64876d775160ba7ae603516e")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.lessonUpdate = (req, res) => {
    // result =   object  inside mongo database
    LessonSchema.findByIdAndUpdate(req.params.id).updateOne(req.body)
        .then((result) => {
            res.send("Update " + result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteLesson = (req, res) => {
    LessonSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
