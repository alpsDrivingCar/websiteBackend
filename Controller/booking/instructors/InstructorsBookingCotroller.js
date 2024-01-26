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
            // "gearbox": gearbox
        };
        let filterisPotential = { isPotential: false }; // Add this line to include isPotential filter
        let instructors = await InstructorsUserSchema.find(filterisPotential);
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
        const {postcode, type: typeId} = req.query;

        if (!postcode) {
            return res.status(404).json({message: 'Postcode is not defined.'});
        }

        const targetTypeOfLesson = await fetchLessonTypeById(typeId);
        if (!targetTypeOfLesson) {
            return res.status(400).send({message: "Invalid type provided"});
        }

        const bookingPackages = await fetchBookingPackages(postcode, targetTypeOfLesson.slug);
        console.log("bookingPackages = " + bookingPackages)

        if (!bookingPackages.length) {
            return res.status(404).send({
                message: "No booking packages found for the given postCode and type."
            });
        }

        const formattedData = formatDataForBooking(bookingPackages);

        const bookingInstructor = new InstructorsSchema(formattedData);
        await bookingInstructor.save();

        return res.json({data: bookingInstructor});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "An error occurred", error});
    }
};


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
            priceSave: `Save £${savings.toFixed(2)}`
        });

        return acc;
    }, {});

    const gearboxData = Object.values(groupedPackages).map(gearbox => {
        return {
            slug: gearbox.slug,
            name: gearbox.name,
            selected: gearbox.slug === 'manual',
            package: gearbox.packages
        };
    });

    return {
        title: "Choose Gearbox…",
        gearbox: gearboxData
    };
};


function convertToNumber(value) {
    const withoutCommaAndExtraPeriods = value.replace(/,/g, '').replace(/\.+(?=\d*\.)/g, '');
    return parseFloat(withoutCommaAndExtraPeriods);
}
