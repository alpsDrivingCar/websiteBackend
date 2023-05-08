const GymSchema = require("../model/gymSchema");

exports.createGym = (req, res) => {
    const gym = new GymSchema(req.body);

    console.log(req.body);
    gym.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.gyms = (req, res) => {
    // result = Array of objects inside mongo database
    GymSchema.find()
        .then((result) => {
            res.status(200).json({data: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.gymById = (req, res) => {
    // result =   object  inside mongo database
    GymSchema.findById(req.params.id)
        .then((result) => {
            res.send("detials " + result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.gymUpdate = (req, res) => {
    // result =   object  inside mongo database
    GymSchema.findByIdAndUpdate(req.params.id).updateOne(req.body)
        .then((result) => {
            res.send("Update " + result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteGym = (req, res) => {
    GymSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}