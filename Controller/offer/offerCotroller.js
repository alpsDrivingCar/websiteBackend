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

    OfferSchema.findById("64b26a3bfeb691283105b1be")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.offerUpdate = (req, res) => {
    OfferSchema.findByIdAndUpdate("64b26a3bfeb691283105b1be").updateOne(req.body)
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
