const HomeSchema = require("../../model/home/homeSchema");

exports.createHome = (req, res) => {
    const homeSchema = new HomeSchema(req.body);

    console.log(req.body);
    homeSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}
//
// exports.homes = (req, res) => {
//     // result = Array of objects inside mongo database
//     HomeSchema.find()
//         .then((result) => {
//             res.status(200).json({data: result});
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// }

exports.homes = (req, res) => {
    // result =   object  inside mongo database
    // HomeSchema.findById(req.params.id)
    HomeSchema.findById("6489c7239bdfd1bbc0d33afc")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.homeUpdate = (req, res) => {
    // result =   object  inside mongo database
    HomeSchema.findByIdAndUpdate("6489c7239bdfd1bbc0d33afc").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteHome = (req, res) => {
    HomeSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
