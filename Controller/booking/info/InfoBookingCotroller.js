const InfoSchema = require("../../../model/booking/info/infoSchema");

exports.createBookingInfo = (req, res) => {
    const lessonSchema = new InfoSchema(req.body);

    console.log(req.body);
    lessonSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.getBookingInfo = (req, res) => {
    // result = Array of objects inside mongo database
    InfoSchema.findById("64859e62519ba1e3fcc98866")
        .then((result) => {
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.bookingInfoByPostCode = (req, res) => {
    // result =   object  inside mongo database
    // LessonSchema.findById(req.params.id)
    InfoSchema.findById("64859e62519ba1e3fcc98866")
        .then((result) => {
            res.json({data: result});

        })
        .catch((err) => {
            console.log(err);
        });
}

exports.bookingInfoUpdate = (req, res) => {
    // result =   object  inside mongo database
    InfoSchema.findByIdAndUpdate("64859e62519ba1e3fcc98866").updateOne(req.body)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
        });


}

exports.deleteBookingInfo = (req, res) => {
    InfoSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
