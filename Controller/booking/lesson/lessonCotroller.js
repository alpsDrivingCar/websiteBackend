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
    let postcode = req.query.postCode;
    const gearbox = req.query.gearbox?.toLowerCase();
    if (!postcode) {
        return res.status(400).json({ message: 'PostCode is required.' });
    }

    // Remove any spaces from postcode
    postcode = postcode.replace(/\s+/g, '');
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
            let availablePackages = await fetchBookingPackages(postcode, type.slug);
            
            // Filter packages by gearbox if the parameter is provided
            if (gearbox && availablePackages.length > 0) {
                availablePackages = availablePackages.filter(pkg => 
                    pkg.slugOfGearbox === 'all' ||
                    (gearbox === 'automatic' ? 
                        ['automatic', 'electric'].includes(pkg.slugOfGearbox) : 
                        pkg.slugOfGearbox === gearbox)
                );
            }
            
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
        case 2:
            return 2;
        case 3:
            return 3;
        case 4:
            return 4;
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
    const postcodeToFetch = postcode.replace(/\s+/g, '');
    const areaLength = determinePostcodeAreaLength(postcodeToFetch);
    const areaPrefix = postcode.substring(0, areaLength).trim();

    // Use exact match with case-insensitive regex
    console.log("slugOfTypeLesson = " + slugOfTypeLesson);

    const regexPostcode = new RegExp("^" + areaPrefix + "$", "i");
    const packages = await PackageSchema.find({
        "postCode.postCode": regexPostcode,  // Exact match, case insensitive
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
