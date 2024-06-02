const HomeSchema = require("../../model/home/homeSchema");
const PackageSchema = require("../../model/booking/package/packageSchema");

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
    const packageQuery = {
        slugOfType: "our_offers_packages" // filtering by slugOfType
    };

   
    PackageSchema.find(packageQuery)
        .then((packages) => {
            if (packages.length === 0) {
                return res.status(404).send({ message: "No booking packages found for the provided postCode and type." });
            }

            return HomeSchema.findById("65991313b4bf8eaf3a858c1b")
                .then((homeData) => {
                    if (!homeData) {
                        return res.status(404).send({ message: "Home data not found." });
                    }

                    // Add packages to the result.newOffers.packages
                    homeData.ourOffer = packages;
                    res.json({ data: homeData });
                });
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
