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
    try {
        // Fetch the lesson document by ID
        const lessonDocument = await LessonSchema.findById("64876d775160ba7ae603516e");
        if (!lessonDocument) {
            return res.status(404).json({ message: 'Lesson not found.' });
        }

        // Check each typeOfLesson for available booking packages
        const filteredTypeOfLesson = await Promise.all(lessonDocument.typeOfLesson.map(async (lessonType) => {
            const hasBookingPackages = await fetchBookingPackages(lessonType.slug);
            return hasBookingPackages ? lessonType : null;
        })).then(results => results.filter(lessonType => lessonType !== null));

        // If none of the lesson types have booking packages, return an error
        if (filteredTypeOfLesson.length === 0) {
            return res.status(404).json({ message: 'No booking packages available for any lesson types.' });
        }

        // Return filtered lesson types with available booking packages
        res.json({
            _id: lessonDocument._id,
            title: lessonDocument.title,
            description: lessonDocument.description,
            typeOfLesson: filteredTypeOfLesson
        });

    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'An error occurred while processing your request.', error: err.message });
    }
};

const fetchBookingPackages = async (slugOfTypeLesson) => {
    try {
        // Assuming PackageSchema is correctly imported and set up
        const packages = await PackageSchema.find({ slugOfType: slugOfTypeLesson });
        console.log(`packages.length ${packages.length} of ${slugOfTypeLesson}`);
        return packages.length > 0;
    } catch (err) {
        console.error(`Error fetching packages for slug ${slugOfTypeLesson}:`, err);
        throw new Error(`Failed to fetch booking packages for slug ${slugOfTypeLesson}`);
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
