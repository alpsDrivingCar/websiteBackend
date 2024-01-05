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
    HomeSchema.findById("6489c7239bdfd1bbc0d33afc")
        .then((result) => {
            // You can modify the result based on the device type if needed
            if (isMobile) {
                // Handle the response for mobile devices
                // For example, modify 'result' or send a different response

                result.title =  result.title + "..."
            } else {
                // Handle the response for non-mobile devices (like browsers)
            }
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
