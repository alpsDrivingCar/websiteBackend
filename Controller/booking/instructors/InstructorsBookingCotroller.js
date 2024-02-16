const InstructorsSchema = require("../../../model/booking/instructors/instructorsSchema");
const LessonEvent = require("../../../model/booking/instructors/lessonEventSchema");
const InstructorsUserSchema = require("../../../model/user/Instructor");
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
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.bookingInstructorsUpdate = (req, res) => {
    // result =   object  inside mongo database
    InstructorsSchema.findByIdAndUpdate("64859e62519ba1e3fcc98866").updateOne(req.body)
        .then((result) => {
            res.json({data: result});
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

/////////////////////////  Get instructors        ///////////////////////////
exports.instructorsByPostcodeAndAvailableTimeAndGearBox = async (req, res) => {
    try {
        const { postcode, availableTime, gearbox } = req.query;
        console.log("Query Params:", postcode, availableTime, gearbox);

        if (!postcode || !gearbox || !availableTime) {
            return res.status(400).json({ message: 'Postcode, gearbox, and availableTime are required query parameters.' });
        }

        const filter = {
            "areas": { $regex: new RegExp("^" + postcode.substring(0, 3), "i") },
            // "gearbox": gearbox, // Uncomment and populate this line as necessary
            "isPotential": false, // Include isPotential in the main filter
            "AcceptStudent": true // Include AcceptStudent in the main filter
        };

        let instructors = await InstructorsUserSchema.find(filter);
        if (!instructors.length) {
            return res.json({data: []});
        }
        // Check if availableTime is an array, if not, make it an array
        const availableTimes = Array.isArray(availableTime) ? availableTime.map(time => new Date(time)) : [new Date(availableTime)];

        instructors = await Promise.all(instructors.map(async (instructor) => {
            try {
                console.log("Checking lessons for instructor:", instructor._id);

                // Check for each available time
                for (const time of availableTimes) {
                    const hasLesson = await LessonEvent.findOne({
                        instructorId: instructor._id,
                        startTime: { $lte: time },
                        endTime: { $gte: time }
                    });

                    if (hasLesson) {
                        console.log("Instructor unavailable at", time, instructor.firstName);
                        return null; // Instructor is unavailable, exclude them
                    }
                }

                return instructor; // Instructor is available at all provided times
            } catch (error) {
                console.error("Error fetching lessons for instructor", instructor._id, error);
                return null;
            }
        }));

        instructors = instructors.filter(instructor => instructor !== null);

        if (!instructors.length) {
            return res.status(404).json({ message: 'No available instructors found for the criteria.' });
        }

        res.json({ data: instructors });

    } catch (error) {
        console.error("Outer Error:", error);
        res.status(500).json({ message: "An error occurred", error });
    }
};

////////////////////// get Booking   //////////////////
exports.getBookingPackagesByPostcodeAndtype = async (req, res) => {
    try {
        const {postcode, type: typeId, packageId} = req.query;

        if (!postcode) {
            return res.status(404).json({message: 'Postcode is not defined.'});
        }

        // Directly fetch and format booking packages based on the provided parameters
        const formattedData = await fetchAndFormatBookingPackages(postcode, typeId, packageId);

        // Create a new InstructorsSchema instance with the formatted data and save it
        const bookingInstructor = new InstructorsSchema(formattedData);
        await bookingInstructor.save();

        return res.json({data: bookingInstructor});
    } catch (error) {
        console.error(error);
        // Use the error message directly for simplicity in this example
        // Adjust status codes and messages as necessary for your application's needs
        return res.status(500).json({message: error.message});
    }
};


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
        console.log(packageId)
        const bookingPackage = await PackageSchema.findById(packageId);
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

    const regexPostcode = new RegExp(`^${postcode.slice(0, 3)}`, 'i');
    console.log("regexPostcode = " + regexPostcode)
    console.log("slugOfTypeLesson = " + slugOfTypeLesson)
    return await PackageSchema.find({
        "postCode.postCode": regexPostcode,
        slugOfType: slugOfTypeLesson
    });


};

const formatDataForBooking = (bookingPackages) => {
    const order = { 'manual': 1, 'automatic': 2, 'electric': 3 };

    const groupedPackages = bookingPackages.reduce((acc, curr) => {

        if (!acc[curr.slugOfGearbox]) {
            acc[curr.slugOfGearbox] = {
                slug: curr.slugOfGearbox,
                name: curr.gearbox,
                selected: curr.slugOfGearbox === 'manual',
                packages: []
            };
        }

        const total = convertToNumber(curr.price);
        const totalBeforeSale = convertToNumber(curr.priecBeforeSele);

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
            selected: gearbox.slug === 'manual',
            package: gearbox.packages
        }));

    return {
        title: "Choose Gearbox…",
        gearbox: gearboxData
    };
};


function convertToNumber(value) {
    const withoutCommaAndExtraPeriods = value.replace(/,/g, '').replace(/\.+(?=\d*\.)/g, '');
    return parseFloat(withoutCommaAndExtraPeriods);
}
