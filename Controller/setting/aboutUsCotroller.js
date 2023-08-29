const AboutusSchema = require("../../model/setting/aboutusSchema");

exports.createAboutus = (req, res) => {
    const aboutusSchema = new AboutusSchema(req.body);

    console.log(req.body);
    aboutusSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.aboutus = (req, res) => {

    AboutusSchema.findById("64e648c09e3a26ecf93d9651")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.aboutusUpdate = (req, res) => {
    AboutusSchema.findByIdAndUpdate("64b26a3bfeb691283105b1be").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteAboutus = (req, res) => {
    AboutusSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
