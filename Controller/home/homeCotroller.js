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

exports.homes = (req, res) => {
    const userAgent = req.headers['user-agent'];
    let isMobile = /mobile/i.test(userAgent);
    console.log("isMobile = " + isMobile)
    console.log("userAgent = " + userAgent)

    let id = isMobile ? "659914cd271e61d45d98c53b" : "65991313b4bf8eaf3a858c1b";

    HomeSchema.findById(id)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error retrieving data");
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
