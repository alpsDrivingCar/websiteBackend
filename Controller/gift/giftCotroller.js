const GiftSchema = require("../../model/gift/giftSchema");

exports.createGift = (req, res) => {
    const giftSchema = new GiftSchema(req.body);

    console.log(req.body);
    giftSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.gifts = (req, res) => {
    // result =   object  inside mongo database
    // GiftSchema.findById(req.params.id)
    GiftSchema.find()
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.giftUpdate = (req, res) => {
    // result =   object  inside mongo database
    GiftSchema.findByIdAndUpdate("6489c7239bdfd1bbc0d33afc").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteGift = (req, res) => {
    GiftSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
