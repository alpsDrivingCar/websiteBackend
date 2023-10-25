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



exports.instructorsByPostcodeAndtype = async (req, res) => {
    try {
        const { postcode, type: typeId } = req.query;

        if (!postcode) {
            return res.status(404).json({ message: 'Postcode is not defined.' });
        }

        const instructors = await fetchInstructorsByPostcode(postcode);
        console.log("instructors = " +instructors )

        if (!instructors.length) {
            return res.status(404).json({
                message: 'No trainers available for this PostCode.'
            });
        }

        const targetTypeOfLesson = await fetchLessonTypeById(typeId);
        if (!targetTypeOfLesson) {
            return res.status(400).send({ message: "Invalid type provided" });
        }

        const bookingPackages = await fetchBookingPackages(postcode, targetTypeOfLesson.slug);
        if (!bookingPackages.length) {
            return res.status(404).send({
                message: "No booking packages found for the given postCode and type."
            });
        }

        console.log("bookingPackages = " +bookingPackages.length )


        const formattedData = formatDataForBookingInstructors(bookingPackages, instructors);

        const bookingInstructor = new InstructorsSchema(formattedData);
        await bookingInstructor.save();

        return res.json({ data: bookingInstructor });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error });
    }
};

const fetchInstructorsByPostcode = async (postcode) => {
    // const filter = { "postCode": new RegExp(`^${postcode}`, "i") };
    const filter = {
        "areas": { $regex: new RegExp("^" + postcode.substring(0, 3), "i") }
    };
    return await InstructorsUserSchema.find(filter);
};

const fetchLessonTypeById = async (typeId) => {
    const lesson = await LessonSchema.findById("64876d775160ba7ae603516e");
    return lesson.typeOfLesson.find(l => l.id === typeId);
};

const fetchBookingPackages = async (postcode, slugOfTypeLesson) => {
    const regexPostcode = new RegExp(`^${postcode.slice(0, 3)}`, 'i');
    return await PackageSchema.find({
        "postCode.postCode": regexPostcode,
        slugOfType: slugOfTypeLesson
    });
};

const formatDataForBookingInstructors = (bookingPackages, instructors) => {
    // First, group the booking packages by their gearbox type
    const groupedPackages = bookingPackages.reduce((acc, curr) => {
        if (!acc[curr.slugOfGearbox]) {
            acc[curr.slugOfGearbox] = {
                slug: curr.slugOfGearbox,
                name: curr.gearbox,
                packages: []
            };
        }
        acc[curr.slugOfGearbox].packages.push(curr);
        return acc;
    }, {});

    // For each gearbox type, map the instructors to their packages
    const gearboxData = Object.values(groupedPackages).map(gearbox => {
        return {
            slug: gearbox.slug,
            name: gearbox.name,
            instructors: instructors.map(instructor => {
                // Use the current gearbox package to calculate the price per hour
                const pricePerHour = gearbox.packages[0] ? gearbox.packages[0].priecBeforeSele / gearbox.packages[0].numberHour : 0;

                return {
                    name: `${instructor.firstName} ${instructor.lastName}`,
                    priceHour: pricePerHour,
                    package: gearbox.packages.map(pkg => {
                        return {
                            numberHour: parseInt(pkg.numberHour),
                            total: convertToNumber(pkg.price),
                            totalBeforeSele:convertToNumber(pkg.priecBeforeSele)
                        };
                    })
                };
            })
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
