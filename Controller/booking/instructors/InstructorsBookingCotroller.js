const InstructorsSchema = require("../../../model/booking/instructors/instructorsSchema");
const InstructorsUserSchema = require("../../../model/user/Instructor");

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

exports.bookingInstructorsByPostCodeAndType = (req, res) => {
    // result =   object  inside mongo database
    // LessonSchema.findById(req.params.id)
    const { id, type } = req.params;

    console.log("id:" + id + "type:" + type)
    InstructorsSchema.findById("64859e62519ba1e3fcc98866")
        .then((result) => {
            res.json({data: result});

        })
        .catch((err) => {
            console.log(err);
        });
}

//
// // Search for a package ID within BookingInstructorsSchema
// exports.bookingInstructorsByPostCode = async (req, res) => {
//     const { bookingId, instructorId, packageId } = req.params;
//     const updatedData = req.body; // This should contain the updated fields
//
//     try {
//         // Find the booking by bookingId
//         const booking = await BookingInstructors.findById(bookingId);
//
//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }
//
//         // Find the correct instructor and package by instructorId and packageId
//         const instructor = booking.gearbox.find(g => g._id.toString() === instructorId);
//
//         if (!instructor) {
//             return res.status(404).json({ message: 'Instructor not found' });
//         }
//
//         const packageToUpdate = instructor.instructors.package.find(p => p._id.toString() === packageId);
//
//         if (!packageToUpdate) {
//             return res.status(404).json({ message: 'Package not found for the given ID' });
//         }
//
//         // Update the package data with the updatedData
//         Object.assign(packageToUpdate, updatedData);
//
//         // Save the changes to the database
//         await booking.save();
//
//         res.json({ message: 'Package updated successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// }
//
//
// // Search for a package ID within InstructorsSchema
// exports.getPackagePrice = async (req, res) => {
//     const {instructorId, packageId} = req.params;
//
//     try {
//         const instructor = await InstructorsSchema.findById(instructorId);
//
//         if (!instructor) {
//             return res.status(404).json({message: 'Instructor not found'});
//         }
//
//         const matchingPackage = instructor.package.find(pkg => pkg._id.equals(mongoose.Types.ObjectId(packageId)));
//
//         if (!matchingPackage) {
//             return res.status(404).json({message: 'Package not found for the given ID'});
//         }
//
//         res.json(matchingPackage);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({message: 'Internal Server Error'});
//     }
// }


exports.bookingInstructorsUpdate = (req, res) => {
    // result =   object  inside mongo database
    InstructorsSchema.findByIdAndUpdate("64859e62519ba1e3fcc98866").updateOne(req.body)
        .then((result) => {
            res.json(result);
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

exports.instructorsByPostcodeAndtype = (req, res) => {
    InstructorsUserSchema.find()
        .then((result) => {
            res.send("Instructors " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
