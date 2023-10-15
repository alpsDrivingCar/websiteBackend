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

exports.bookingPackageByPostCode = (req, res) => {
    const { postcode } = req.query;

    // Validate if postcode is provided in the query
    if (!postcode || postcode.length < 3) {
        return res.status(400).send({ message: "At least the first 3 digits of the postcode are required in the query." });
    }

    // Create a regex to match the first three digits of the postcode
    const regex = new RegExp(`^${postcode.slice(0, 3)}`, 'i'); // 'i' makes it case insensitive

    // Query the database for booking packages with postcodes that start with the provided 3 digits
    PackageSchema.find({ "postCode.postCode": regex })
        .then((packages) => {
            if (packages.length === 0) {
                return res.status(404).send({ message: `No booking packages found for postcode starting with: ${postcode.slice(0, 3)}` });
            }

            res.send(packages);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Error occurred while fetching the booking packages." });
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
