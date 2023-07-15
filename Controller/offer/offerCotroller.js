const OfferSchema = require("../../model/offer/offerSchema");

exports.createOffer = (req, res) => {
    const offerSchema = new OfferSchema(req.body);

    console.log(req.body);
    offerSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.offers = (req, res) => {

    OfferSchema.findById("64b261971b77a1337254e45a")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.offerUpdate = (req, res) => {
    OfferSchema.findByIdAndUpdate("64b1a5e956d64d9410eeb286").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteOffer = (req, res) => {
    OfferSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
