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

    // Return all lessons if postcode is not provided or empty
    if (!postcode) {
        LessonSchema.findById("64876d775160ba7ae603516e")
            .then(lessons => {
                return res.json(lessons);
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ message: 'Error fetching lessons.' });
            });
    } else {
        // Check if postcode is long enough
        if (postcode.length < 3) {
            return res.status(400).json({ message: 'Invalid postcode format.' });
        }

        // Updated filter to search within 'areas' array for the first 3 characters of the postcode
        const filter = {
            "areas": { $regex: new RegExp("^" + postcode.substring(0, 3), "i") }
        };

        InstructorsUserSchema.find(filter)
            .then(result => {
                if (result.length === 0) {
                    return res.status(404).json({ message: 'There are no trainers available in this PostCode. Please try another PostCode, such as NN2 8FW' });
                } else {
                    LessonSchema.findById("64876d775160ba7ae603516e")
                        .then(lessonResult => {
                            return res.json(lessonResult);
                        })
                        .catch(err => {
                            console.log(err);
                            return res.status(404).json({ message: err });
                        });
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(404).json({ message: err });
            });
    }
};


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
