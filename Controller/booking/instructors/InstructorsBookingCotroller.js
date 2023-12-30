const InstructorsSchema = require("../../../model/booking/instructors/instructorsSchema");
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

        // Check for mandatory parameters
        if (!postcode || !gearbox) {
            return res.status(400).json({ message: 'Postcode and gearbox are required query parameters.' });
        }

        // Construct the filter
        const filter = {
            "areas": { $regex: new RegExp("^" + postcode.substring(0, 3), "i") },
            // "gearbox": gearbox
        };

        // // Include availableTime in filter if provided
        // if (availableTime) {
        //     filter["availableTimes"] = { $in: [availableTime] };
        // }
        console.log("availableTime" + availableTime)

        const instructors = await InstructorsUserSchema.find(filter);

        if (!instructors.length) {
            return res.status(404).json({ message: 'No instructors found matching the criteria.' });
        }

        res.json({ data: instructors });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};


////////////////////// get Booking   //////////////////
exports.getBookingPackagesByPostcodeAndtype = async (req, res) => {
    try {
        const { postcode, type: typeId } = req.query;

        if (!postcode) {
            return res.status(404).json({ message: 'Postcode is not defined.' });
        }

        const targetTypeOfLesson = await fetchLessonTypeById(typeId);
        if (!targetTypeOfLesson) {
            return res.status(400).send({ message: "Invalid type provided" });
        }

        const bookingPackages = await fetchBookingPackages(postcode, targetTypeOfLesson.slug);
        console.log("bookingPackages = "+bookingPackages )

        if (!bookingPackages.length) {
            return res.status(404).send({
                message: "No booking packages found for the given postCode and type."
            });
        }

        const formattedData = formatDataForBooking(bookingPackages);

        const bookingInstructor = new InstructorsSchema(formattedData);
        await bookingInstructor.save();

        return res.json({ data: bookingInstructor });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error });
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
    // Group the booking packages by their gearbox type
    const groupedPackages = bookingPackages.reduce((acc, curr) => {
        if (!acc[curr.slugOfGearbox]) {
            acc[curr.slugOfGearbox] = {
                slug: curr.slugOfGearbox,
                name: curr.gearbox,
                packages: []  // Moved the packages array here
            };
        }
        acc[curr.slugOfGearbox].packages.push({
            packageId: curr.id,
            numberHour: parseInt(curr.numberHour),
            numberOfLessons: parseInt(curr.numberHour) / 2,  // Calculate number of lessons
            total: convertToNumber(curr.price),
            totalBeforeSele: convertToNumber(curr.priecBeforeSele)
        });
        return acc;
    }, {});

    // Map the instructors to each gearbox type
    const gearboxData = Object.values(groupedPackages).map(gearbox => {
        return {
            slug: gearbox.slug,
            name: gearbox.name,
            package: gearbox.packages,  // Assigning the packages array here
            // instructors: instructors.map(instructor => {
            //     // Calculate the price per hour for the instructor
            //     const pricePerHour = gearbox.packages[0] ? gearbox.packages[0].totalBeforeSele / gearbox.packages[0].numberHour : 0;
            //     return {
            //         name: `${instructor.firstName} ${instructor.lastName}`,
            //         priceHour: pricePerHour
            //     };
            // })
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
