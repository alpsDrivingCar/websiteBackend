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

    const postcode = req.query.postcode;
    const type = req.query.type;

    const filter = {
        "postCode": postcode,
    };

    // const result1 =  Instructor.find(filter);

    InstructorsUserSchema.find(filter)
        .then((result) => {
            if (result.length === 0) {
                // If no data is found, return a "not found" response
                return res.status(404).json({ message: 'Data not found for the specified postcode.' });
            }
        })
        .catch((err) => {
            console.log(err);
        });

    InstructorsSchema.findById("64859e62519ba1e3fcc98866")
        .then((result) => {
            res.json({data: result});

        })
        .catch((err) => {
            console.log(err);
        });
}
