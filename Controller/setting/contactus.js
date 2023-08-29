const ContactUsSchema = require("../../model/setting/contactUsSchema");

exports.createContactUs = (req, res) => {
    const contactUsSchema = new ContactUsSchema(req.body);

    console.log(req.body);
    contactUsSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.contactUs = (req, res) => {

    ContactUsSchema.findById("64e648c09e3a26ecf93d9651")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.contactUsUpdate = (req, res) => {
    ContactUsSchema.findByIdAndUpdate("64b26a3bfeb691283105b1be").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}


exports.deleteContactUs = (req, res) => {
    ContactUsSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
