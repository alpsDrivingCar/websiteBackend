const FranchiseSchema = require("../../model/setting/franchiseSchema");

exports.createFranchise = (req, res) => {
    const franchiseSchema = new FranchiseSchema(req.body);

    console.log(req.body);
    franchiseSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.franchise = (req, res) => {

    FranchiseSchema.findById("64e648c09e3a26ecf93d9651")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.franchiseUpdate = (req, res) => {
    FranchiseSchema.findByIdAndUpdate("64b26a3bfeb691283105b1be").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteFranchise = (req, res) => {
    FranchiseSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
