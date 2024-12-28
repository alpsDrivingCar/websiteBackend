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

    if (!postcode) {
        return res.status(400).json({ message: 'PostCode is required.' });
    }

    const areaLength = determinePostcodeAreaLength(postcode);
    const areaPrefix = postcode.substring(0, areaLength).trim();
    const areaRegex = new RegExp("^" + areaPrefix, "i");

    const filter = {
        "areas": { $regex: areaRegex }
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

        const promises = lessonResult.typeOfLesson.map(async (type) => {
            const availablePackages = await fetchBookingPackages(postcode, type.slug);
            if (availablePackages.length > 0) {
            // Sort packages by numberHour in ascending order
            const sortedPackages = availablePackages.sort((a, b) => a.numberHour - b.numberHour);
            const typeObj = type.toObject();
            return {
                ...typeObj,
                availablePackages: sortedPackages
            };
            }
            return null;
        });

        const filteredTypes = (await Promise.all(promises)).filter(type => type !== null);
        
        // Create a new object instead of modifying lessonResult directly
        const response = lessonResult.toObject();
        response.typeOfLesson = filteredTypes;
        res.json(response);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while processing your request.', error: err.message });
    }
};

const determinePostcodeAreaLength = (postcode) => {
    switch (postcode.length) {
        case 5:
            return 2;
        case 6:
            return 3;
        case 7:
            return 4;
        default:
            return 3; // Default value, can be adjusted as needed
    }
};

const fetchBookingPackages = async (postcode, slugOfTypeLesson) => {
    const areaLength = determinePostcodeAreaLength(postcode);
    const areaPrefix = postcode.substring(0, areaLength).trim();
    const regexPostcode = new RegExp("^" + areaPrefix, "i");

    console.log("regexPostcode = " + regexPostcode);
    console.log("slugOfTypeLesson = " + slugOfTypeLesson);

    const packages = await PackageSchema.find({
        "postCode.postCode": regexPostcode,
        slugOfType: slugOfTypeLesson,
        status: 'active'
    });

    // Add numberOfLessons to each package
    return packages.map(package => {
        const packageObj = package.toObject();
        packageObj.numberOfLessons = Math.floor(packageObj.numberHour / 2);
        return packageObj;
    });
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
