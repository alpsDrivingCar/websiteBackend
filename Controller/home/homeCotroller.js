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
    const isMobile = /mobile/i.test(userAgent);

    console.log("isMobile = " + isMobile);
    console.log("userAgent = " + userAgent);

    const id = "66559eadbdb78e10ec85442f"

    HomeSchema.findById(id)
        .then((result) => {
            if (!result) {
                return res.status(404).json({ message: 'Home not found' });
            }

            const response = {
                ...result.toObject(),
                hotBox: isMobile ? result.hotBoxMobile : result.hotBoxDesktop
            };

            res.json(response);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: 'Error retrieving data' });
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
