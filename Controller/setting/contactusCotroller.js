const ContactusSchema = require("../../model/setting/contactusSchema");

exports.createContactus = (req, res) => {
    const contactusSchema = new ContactusSchema(req.body);

    console.log(req.body);
    contactusSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.contactuss = (req, res) => {
    // result =   object  inside mongo database
    // ContactusSchema.findById(req.params.id)
    ContactusSchema.find()
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.contactusUpdate = (req, res) => {
    // result =   object  inside mongo database
    ContactusSchema.findByIdAndUpdate("6489c7239bdfd1bbc0d33afc").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteContactus = (req, res) => {
    ContactusSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
