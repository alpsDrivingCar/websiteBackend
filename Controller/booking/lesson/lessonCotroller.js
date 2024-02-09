const LessonSchema = require("../../../model/booking/lesson/lessonSchema");
const InstructorsUserSchema = require("../../../model/user/Instructor");
const PackageSchema = require("../../../model/booking/package/packageSchema");

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
        "areas": { $regex: new RegExp("^" + postcode.substring(0, 3), "i") }
    };

    try {
        const instructors = await InstructorsUserSchema.find(filter);
        if (instructors.length === 0) {
            return res.status(404).json({ message: 'There are no trainers available in this PostCode. Please try another PostCode, such as NN2 8FW' });
        }

        const lessonResult = await LessonSchema.findById("64876d775160ba7ae603516e");
        if (!lessonResult) {
            return res.status(404).json({ message: 'Lesson not found.' });
        }

        // Assuming lessonResult.typeOfLesson is an array from your previous message
        const promises = lessonResult.typeOfLesson.map(async (type) => {
            const hasBookingPackages = await fetchBookingPackages(postcode,type.slug);
            return hasBookingPackages ? type : null;
        });

        const filteredTypes = (await Promise.all(promises)).filter(type => type !== null);

        // Modify lessonResult to only include types with available booking packages
        lessonResult.typeOfLesson = filteredTypes;

        res.json(lessonResult);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while processing your request.', error: err.message });
    }
};


const fetchBookingPackages = async (postcode, slugOfTypeLesson) => {
    // Adjust the regex to be even more inclusive if needed, or keep it targeted to the first 3 characters
    const regexPostcode = new RegExp(`^${postcode.slice(0, 3)}`, 'i');

    console.log("regexPostcode = " + regexPostcode);
    console.log("slugOfTypeLesson = " + slugOfTypeLesson);

    const packages = await PackageSchema.find({
        "postCode.postCode": regexPostcode,
        slugOfType: slugOfTypeLesson
    });

    return packages.length > 0;
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
