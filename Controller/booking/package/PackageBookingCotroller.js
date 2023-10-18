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


exports.updateBookingPackage = async (req, res) => {
    const packageId = req.params.id;
    if (!packageId) {
        return res.status(400).send({ message: "BookingPackage id is required" });
    }
    req.query

    const updateValues = {
        slugOfType: "Standard Packages",
        typeName: "standard_packages"
    };

    try {
        const updatedPackage = await PackageSchema.findByIdAndUpdate(
            packageId,
            updateValues,
            { new: true }  // This option returns the modified document rather than the original.
        );

        if (!updatedPackage) {
            return res.status(404).send({ message: "BookingPackage not found with id " + packageId });
        }

        res.send(updatedPackage);
    } catch (err) {
        return res.status(500).send({ message: "Error updating BookingPackage with id " + packageId });
    }
};



exports.getPackagesBySlug = async (req, res) => {
    const slug = req.query.slugOfType; // Assuming you'll be passing the slug as ?slugOfType=value

    if (!slug) {
        return res.status(400).send({ message: "slugOfType query parameter is required" });
    }

    try {
        const packages = await PackageSchema.find({ slugOfType: slug });

        if (packages.length === 0) {
            return res.status(404).send({ message: "No BookingPackages found for the provided slugOfType." });
        }

        res.send(packages);
    } catch (err) {
        return res.status(500).send({ message: "Error retrieving BookingPackages." });
    }
};
