const LocationsSchema = require("../../model/locations/locationsSchema");

exports.createLocations = (req, res) => {
    const locationsSchema = new LocationsSchema(req.body);

    console.log(req.body);
    locationsSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.locationss = (req, res) => {
    // result =   object  inside mongo database
    // LocationsSchema.findById(req.params.id)
    console.log("req.body" + req.body)
    Locations.findByIdAndUpdate("654beda5ab97a73c1a91a53e", req.body, { new: true })
        .then((result) => {
            res.json({ data: result.data });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        });
}

exports.locationsUpdate = (req, res) => {
    // result =   object  inside mongo database
    console.log(req.body)
    LocationsSchema.findByIdAndUpdate("654beda5ab97a73c1a91a53e").updateOne(req.body)
        .then((result) => {
            res.json({data : result.data})
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteLocations = (req, res) => {
    LocationsSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
