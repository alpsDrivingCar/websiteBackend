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
    const filter = { "postCode": new RegExp(`^${postcode}`, "i") };
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
    return {
        title: "Your title here",
        gearbox: bookingPackages.map(bookingPackage => ({
            slug: bookingPackage.slugOfGearbox,
            name: bookingPackage.gearbox,
            instructors: instructors.map(instructor => ({
                name: `${instructor.firstName} ${instructor.lastName}`,
                priceHour: instructor.hourlyCost,
                package: [{
                    numberHour: parseInt(bookingPackage.numberHour),
                    total: bookingPackage.price
                }]
            }))
        }))
    };
};

