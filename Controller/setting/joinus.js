const JoinusSchema = require("../../model/setting/joinusSchema");

exports.createJoinus = (req, res) => {
    const joinusSchema = new JoinusSchema(req.body);

    console.log(req.body);
    joinusSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.joinus = (req, res) => {

    JoinusSchema.findById("64e648c09e3a26ecf93d9651")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.joinusUpdate = (req, res) => {
    JoinusSchema.findByIdAndUpdate("64b26a3bfeb691283105b1be").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteJoinus = (req, res) => {
    JoinusSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
