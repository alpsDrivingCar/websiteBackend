const PackageSchema = require("../../../model/booking/package/packageSchema");

exports.createBookingPackage = (req, res) => {
    const bookingSchema = new PackageSchema(req.body);

    console.log(req.body);
    bookingSchema.save()
        .then(result => {
            res.json({message : "Booking package successfully created" , data : result});
        })
        .catch(err => {
            console.log(err);
        });

}

exports.getBookingPackageById = (req, res) => {
    // result = Array of objects inside mongo database
    const { id } = req.params;

    PackageSchema.findById(id)
        .then((result) => {
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.bookingPackageByPostCodeAndType = (req, res) => {
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

    if (!postcode || postcode.length < 3) {
        return res.status(400).send({ message: "At least the first 3 digits of the postcode are required in the query." });
    }
    const regex = new RegExp(`^${postcode.slice(0, 3)}`, 'i'); // 'i' makes it case insensitive
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

exports.updateBookingPackage = (req, res) => {
    const { id } = req.params;

    // Validation
    console.log(id)

    PackageSchema.findById(id)
        .then(existingPackage => {
            console.log(existingPackage)
            if (!existingPackage) {
                return res.status(404).json({ message: 'Booking package not found.' });
            }

            // Overwrite fields in the existing document with the new values from the request
            for (let key in req.body) {
                existingPackage[key] = req.body[key];
            }

            // Now save the updated document
             existingPackage.save();
        })
        .then(result => {
            console.log("existingPackage = ")
            return res.json({message: 'Booking package updated successfully.',});
        })
        .catch(err => {
            console.log(err);
            return  res.status(500).json({ message: 'An error occurred while updating the booking package.' });
        });
}

exports.getPackagesBySlug = async (req, res) => {
    const slug = req.query.slugOfType; // Assuming you'll be passing the slug as ?slugOfType=value

    if (!slug) {
        return res.status(400).send({ message: "slugOfType query parameter is required" });
    }

    let query = {};
    if (slug !== "all") {
        query.slugOfType = slug;
    }

    try {
        const packages = await PackageSchema.find(query);

        if (packages.length === 0) {
            return res.status(404).send({ message: "No BookingPackages found for the provided slugOfType." });
        }

        res.send(packages);
    } catch (err) {
        return res.status(500).send({ message: "Error retrieving BookingPackages." });
    }
};



