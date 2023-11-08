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
    LocationsSchema.findById("654beda5ab97a73c1a91a53e")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.locationsUpdate = (req, res) => {
    // result =   object  inside mongo database
    LocationsSchema.findByIdAndUpdate("654bebdca0f71b4f75a5fcc8").updateOne(req.body)
        .then((result) => {
            res.json(result)
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
