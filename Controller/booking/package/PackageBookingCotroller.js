const PackageSchema = require("../../../model/booking/package/packageSchema");

exports.createBookingPackage = (req, res) => {
    const lessonSchema = new PackageSchema(req.body);

    console.log(req.body);
    lessonSchema.save()
        .then(result => {
            res.json({data : result});
        })
        .catch(err => {
            console.log(err);
        });

}

exports.getBookingPackage = (req, res) => {
    // result = Array of objects inside mongo database
    PackageSchema.findById("64859e62519ba1e3fcc98866")
        .then((result) => {
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.bookingPackageByPostCodeAndType = (req, res) => {
    // result =   object  inside mongo database
    // LessonSchema.findById(req.params.id)
    const { id, type } = req.params;

    console.log("id:" + id + "type:" + type)
    PackageSchema.findById("64859e62519ba1e3fcc98866")
        .then((result) => {
            res.json({data: result});

        })
        .catch((err) => {
            console.log(err);
        });
}


exports.bookingPackageUpdate = (req, res) => {
    // result =   object  inside mongo database
    PackageSchema.findByIdAndUpdate("64859e62519ba1e3fcc98866").updateOne(req.body)
        .then((result) => {
            res.json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });


}

exports.deleteBookingPackage = (req, res) => {
    PackageSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
