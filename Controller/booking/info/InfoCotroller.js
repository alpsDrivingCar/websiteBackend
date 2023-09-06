const InfoSchema = require("../../../model/booking/info/infoSchema");

exports.createInfo = (req, res) => {
    const infoSchema = new InfoSchema(req.body);

    console.log(req.body);
    infoSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.infos = (req, res) => {
    // result = Array of objects inside mongo database
    InfoSchema.find()
        .then((result) => {
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.infoByPostCode = (req, res) => {
    // result =   object  inside mongo database
    // InfoSchema.findById(req.params.id)
    InfoSchema.findById("64876d775160ba7ae603516e")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.infoUpdate = (req, res) => {
    // result =   object  inside mongo database
    InfoSchema.findByIdAndUpdate(req.params.id).updateOne(req.body)
        .then((result) => {
            res.send("Update " + result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteInfo = (req, res) => {
    InfoSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
