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

exports.lessonByPostCode = async (req, res) => {
    const postcode = req.query.postCode;

    const filter = {
        "postCode": postcode,
    };

    if (postcode === undefined || postcode === null) {
        return res.status(404).json({message: 'Postcode is not defined.'});
    } else {
        InstructorsUserSchema.find(filter)
            .then((result) => {
                // console.log(result)
                if (result.length === 0) {
                    // If no data is found, return a "not found" response
                    return res.status(404).json({message: 'Data not found for the specified postcode.'});
                } else {
                    LessonSchema.findById("64876d775160ba7ae603516e")
                        .then((result) => {
                            return res.json(result)
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(404).json({message: err});
                        });
                }
            }).catch((err) => {
            console.log(err);
            return res.status(404).json({message: err});
        });
    }
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
