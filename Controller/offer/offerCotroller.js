const OfferSchema = require("../../model/offer/offerSchema");
const {mongoose} = require('mongoose');


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
exports.offersById = (req, res) => {
    const featureId = req.params.id;
    try {
        
        if (!mongoose.Types.ObjectId.isValid(featureId)) {
            throw new Error("Invalid packageId format: " + packageId);
        }

        OfferSchema.findOne({
            'typeOffer.offers._id': new mongoose.Types.ObjectId(featureId)
        }).then((result) => {
            if (result)
                res.json(result)
            else {
                throw new Error("no data based this id ")
            }
        }).catch((err) => {
            console.log(err);
            throw new Error("error " + err);
        });
    } catch (error) {
        return res.status(500).json({error: error.message});
    }

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
