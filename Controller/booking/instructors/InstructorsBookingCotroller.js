const InstructorsSchema = require("../../../model/booking/instructors/instructorsSchema");
const LessonEvent = require("../../../model/booking/instructors/lessonEventSchema");
const InstructorsUserSchema = require("../../../model/user/Instructor");
const TraineesUserSchema = require("../../../model/user/Trainees");
const LessonSchema = require("../../../model/booking/lesson/lessonSchema");
const PackageSchema = require("../../../model/booking/package/packageSchema");

exports.createBookingInstructors = (req, res) => {
    const lessonSchema = new InstructorsSchema(req.body);

    console.log(req.body);
    lessonSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.getBookingInstructors = (req, res) => {
    // result = Array of objects inside mongo database
    InstructorsSchema.findById("64859e62519ba1e3fcc98866")
        .then((result) => {
            res.status(200).json({ data: result });
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.bookingInstructorsUpdate = (req, res) => {
    // result =   object  inside mongo database
    InstructorsSchema.findByIdAndUpdate("64859e62519ba1e3fcc98866").updateOne(req.body)
        .then((result) => {
            res.json({ data: result });
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteBookingInstructors = (req, res) => {
    InstructorsSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}


/////////////////////////// end cred ///////////////////////////////////////

// Function to get instructors and trainees by postcode, available time, and gearbox
exports.instructorsByPostcodeAndAvailableTimeAndGearBox = async (req, res) => {
    try {
        const { postcode, availableTime, gearbox } = req.query;

        if (!postcode || !availableTime) {
            return res.status(400).json({ message: 'Postcode and availableTime are required query parameters.' });
        }

        const areaLength = determinePostcodeAreaLength(postcode);
        const areaPrefix = postcode.substring(0, areaLength).trim();
        const postcodePattern = new RegExp("^" + areaPrefix, "i");
        const regexPattern = new RegExp(gearbox, "i");

        // Define filter criteria for instructors
        const instructorFilter = {
            "areas": { $regex: postcodePattern },
            "AcceptStudent": true,
            "status": "active"
        };

        // Define filter criteria for trainers (without gearbox)
        const trainerFilter = {
            "areas": { $regex: postcodePattern },
            "gearbox": { $regex: regexPattern },
            "AcceptStudent": true
        };
        // Conditionally add gearbox filter if gearbox is not "all"
        if (gearbox && gearbox.toLowerCase() !== "all") {
            const regexPattern = new RegExp(gearbox, "i");
            instructorFilter["gearbox"] = { $regex: regexPattern };
            trainerFilter["gearbox"] = { $regex: regexPattern };
        }

        // Find instructors and trainees
        let [instructors, trainers] = await Promise.all([
            InstructorsUserSchema.find(instructorFilter),
            TraineesUserSchema.find(trainerFilter)
        ]);

        let users = [...instructors, ...trainers];

        if (!users.length) {
            return res.json({ data: [] });
        }
        // Check if availableTime is an array, if not, make it an array
        const availableTimes = Array.isArray(availableTime) ? availableTime.map(time => new Date(time)) : [new Date(availableTime)];

        // Filter users based on available time
        users = await Promise.all(users.map(async (user) => {
            try {
                for (const time of availableTimes) {
                    const hasLesson = await LessonEvent.findOne({
                        $or: [
                            { instructorId: user._id },
                            { trainerId: user._id }
                        ],
                        startTime: { $lte: time },
                        endTime: { $gte: time }
                    });

                    if (hasLesson) {
                        return null;
                    }
                }
                return user;
            } catch (error) {
                console.error("Error fetching lessons for user", user._id, error);
                return null;
            }
        }));

        users = users.filter(user => user !== null);

        if (!users.length) {
            return res.json({ data: [] });
        }

        res.json({ data: users });

    } catch (error) {
        console.error("Outer Error:", error);
        res.status(500).json({ message: "An error occurred", error });
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


////////////////////// get Booking   //////////////////
exports.getBookingPackagesByPostcodeAndtype = async (req, res) => {
    try {
        const { postcode, type: typeId, packageId } = req.query;

        if (!postcode) {
            return res.status(404).json({ message: 'Postcode is not defined.' });
        }

        // Directly fetch and format booking packages based on the provided parameters
        const formattedData = await fetchAndFormatBookingPackages(postcode, typeId, packageId);

        // Create a new InstructorsSchema instance with the formatted data and save it
        const bookingInstructor = new InstructorsSchema(formattedData);

        // Sort the data by price
        const sortedData = sortDataByNumberHour(bookingInstructor);

        return res.json({ data: sortedData });
    } catch (error) {
        console.error(error);
        // Use the error message directly for simplicity in this example
        // Adjust status codes and messages as necessary for your application's needs
        return res.status(500).json({ message: error.message });
    }
};

function sortDataByNumberHour(formattedData) {
    formattedData.gearbox.forEach(gearbox => {
        gearbox.package.sort((a, b) => a.numberHour - b.numberHour);
    });
    return formattedData;
}

async function fetchAndFormatBookingPackages(postcode, typeId, packageId) {
    let formattedData;

    if (packageId) {
        // Fetch a single booking package by ID and ensure it matches the postcode
        const bookingPackage = await fetchPackageById(packageId);
        if (!bookingPackage) {
            throw new Error("No booking package found for the given packageId and postcode.");
        }
        formattedData = formatDataForBooking([bookingPackage]); // Format single package
    } else if (typeId) {
        // Fetch booking packages by type and postcode
        const targetTypeOfLesson = await fetchLessonTypeById(typeId);
        if (!targetTypeOfLesson) {
            throw new Error("Invalid type provided");
        }
        const bookingPackages = await fetchBookingPackages(postcode, targetTypeOfLesson.slug);
        if (!bookingPackages.length) {
            throw new Error("No booking packages found for the given postcode and type.");
        }
        formattedData = formatDataForBooking(bookingPackages); // Format multiple packages
    } else {
        throw new Error('Either type or packageId must be provided.');
    }

    return formattedData;
}
async function fetchPackageById(packageId) {
    try {
        console.log(packageId);
        const bookingPackage = await PackageSchema.findById(packageId).sort({ "gearbox": 1 });
        return bookingPackage;
    } catch (error) {
        console.error('Error fetching package by ID:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}




const fetchLessonTypeById = async (typeId) => {
    const lesson = await LessonSchema.findById("64876d775160ba7ae603516e");
    return lesson.typeOfLesson.find(l => l.id === typeId);
};

const fetchBookingPackages = async (postcode, slugOfTypeLesson) => {
    const areaLength = determinePostcodeAreaLength(postcode);
    const areaPrefix = postcode.substring(0, areaLength).trim();
    const regexPostcode = new RegExp("^" + areaPrefix, "i");

    console.log("regexPostcode = " + regexPostcode)
    console.log("slugOfTypeLesson = " + slugOfTypeLesson)
    return await PackageSchema.find({
        "postCode.postCode": regexPostcode,
        slugOfType: slugOfTypeLesson
    });
};

const formatDataForBooking = (bookingPackages) => {
    const order = { 'manual': 1, 'automatic': 2, 'electric': 3 };

    // Check if 'manual' exists in the booking packages
    let selectedGearbox = bookingPackages.some(package => package.slugOfGearbox === 'manual') ? 'manual' : '';

    // If 'manual' doesn't exist, check if 'automatic' exists
    if (!selectedGearbox) {
        selectedGearbox = bookingPackages.some(package => package.slugOfGearbox === 'automatic') ? 'automatic' : '';
    }

    // If neither 'manual' nor 'automatic' exists, default to 'electric'
    if (!selectedGearbox) {
        selectedGearbox = 'electric';
    }

    const groupedPackages = bookingPackages.reduce((acc, curr) => {
        if (!acc[curr.slugOfGearbox]) {
            acc[curr.slugOfGearbox] = {
                slug: curr.slugOfGearbox,
                name: curr.gearbox,
                selected: curr.slugOfGearbox === selectedGearbox,
                packages: []
            };
        }

        console.log(`curr ${curr.title}`);
        const total = convertToNumber(curr.price, "price");
        const totalBeforeSale = convertToNumber(curr.priecBeforeSele, "priecBeforeSele");

        // Calculate the savings
        const savings = totalBeforeSale - total;
        const savingsPercentage = (savings / totalBeforeSale) * 100;

        acc[curr.slugOfGearbox].packages.push({
            packageId: curr.id,
            numberHour: parseInt(curr.numberHour),
            numberOfLessons: parseInt(curr.numberHour) / 2,
            total: total,
            totalBeforeSale: totalBeforeSale,
            saveUp: `Save Up To ${savingsPercentage.toFixed(0)}%!`,
            priceSave: `Saving of £${savings.toFixed(2)}`
        });

        return acc;
    }, {});

    const gearboxData = Object.values(groupedPackages)
        .sort((a, b) => order[a.slug] - order[b.slug])
        .map(gearbox => ({
            slug: gearbox.slug,
            name: gearbox.name,
            selected: gearbox.slug === selectedGearbox,
            package: gearbox.packages
        }));

    return {
        title: "Choose Gearbox…",
        gearbox: gearboxData
    };
};


function convertToNumber(value, name) {
    console.log(`value ${value}`);
    if (value) {
        const withoutCommaAndExtraPeriods = value.replace(/,/g, '').replace(/\.+(?=\d*\.)/g, '');
        return parseFloat(withoutCommaAndExtraPeriods);
    } else {
        console.error(`Cannot convert '${value}' to a number in function '${name}'`);
        throw new Error(`Cannot convert '${value}' to a number in function '${name}'`);
    }

}
