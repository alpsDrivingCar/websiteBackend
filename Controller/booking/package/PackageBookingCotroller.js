const PackageSchema = require("../../../model/booking/package/packageSchema");
 
exports.createBookingPackage = (req, res) => {
    const bookingSchema = new PackageSchema(req.body);

    console.log(req.body);
    bookingSchema.save()
        .then(result => {
            res.json({message: "Booking package successfully created", data: result});
        })
        .catch(err => {
            console.log(err);
        });

}

exports.getBookingPackageById = (req, res) => {
    // result = Array of objects inside mongo database
    const {id} = req.params;

    PackageSchema.findById(id)
        .then((result) => {
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}


exports.bookingPackageByPostCodeAndType = (req, res) => {
    const {postCode, type} = req.query;


    if (!postCode || !type) {
        return res.status(400).send({message: "Both postCode and type query parameters are required"});
    }

    const regex = new RegExp(`^${postCode.slice(0, 3)}`, 'i'); // 'i' makes it case insensitive

    // Set up the query to filter by postCode and slugOfType
    const query = {
        "postCode.postCode": regex,   // filtering by nested postCode in the array
        slugOfType: type                 // filtering by slugOfType
    };

    PackageSchema.find(query)
        .then((result) => {
            if (result.length === 0) {
                return res.status(404).send({message: "No booking packages found for the provided postCode and type."});
            }
            res.json({data: result});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({message: "Error retrieving booking packages."});
        });
};

exports.bookingPackageByPostCode = (req, res) => {
    const {postcode} = req.query;

    if (!postcode || postcode.length < 3) {
        return res.status(400).send({message: "At least the first 3 digits of the postcode are required in the query."});
    }
    const regex = new RegExp(`^${postcode.slice(0, 3)}`, 'i'); // 'i' makes it case insensitive
    PackageSchema.find({"postCode.postCode": regex})
        .then((packages) => {
            if (packages.length === 0) {
                return res.status(404).send({message: `No booking packages found for postcode starting with: ${postcode.slice(0, 3)}`});
            }

            res.send(packages);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({message: "Error occurred while fetching the booking packages."});
        });
}


exports.deleteBookingPackage = (req, res) => {
    PackageSchema.findById(req.params.id)
        .then((package) => {
            if (!package) {
                return res.status(404).json({message: "Package not found!"});
            }

            PackageSchema.findByIdAndDelete(req.params.id).then((result) => {
                return res.json({message: "Delete Success"});
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({message: "An error occurred."});
        });
};

exports.updateBookingPackage = (req, res) => {
    const {id} = req.params;

    // Validation
    console.log(id)

    PackageSchema.findById(id)
        .then(existingPackage => {
            console.log(existingPackage)
            if (!existingPackage) {
                return res.status(404).json({message: 'Booking package not found.'});
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
            return res.status(500).json({message: 'An error occurred while updating the booking package.'});
        });
}
exports.getPackagesBySlug = async (req, res) => {
    const { postCode, gearbox } = req.body;
    const slug = req.query.slugOfType; // Extract slug from query parameters

    let query = {};

    // Apply slug filter unless the slug is 'all'
    if (slug !== "all") {
        query.slugOfType = slug;
    }

    // Only add gearbox to the query if it is provided and not empty
    if (gearbox && gearbox.length > 0) {
        query.gearbox = { $in: gearbox };
    }

    // Only add postCode to the query if it is provided and not empty
    if (postCode && postCode.length > 0) {
        // Using regex to match the first 3 characters of postCode, case-insensitive
        const regexes = postCode.map(code => new RegExp(`^${code.slice(0, 3)}`, 'i'));
        query['postCode.postCode'] = { $in: regexes };
    }

    try {
        const packages = await PackageSchema.find(query);

        if (packages.length === 0) {
            return res.status(404).send({message: "No BookingPackages found for the provided filters."});
        }

        res.send(packages);
    } catch (err) {
        return res.status(500).send({message: "Error retrieving BookingPackages."});
    }
};




