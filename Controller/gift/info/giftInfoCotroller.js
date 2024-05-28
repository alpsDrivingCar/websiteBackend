const GiftInfoSchema = require("../../../model/gift/giftInfoSchema");
const GiftSchema = require('../../../model/gift/giftSchema');

exports.createGift = (req, res) => {
    const giftSchema = new GiftInfoSchema(req.body);

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
    GiftInfoSchema.find()
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.getGiftId = (req, res) => {
    GiftInfoSchema.findById("665590924d64fb738265a259")
        .then(giftInfo => {
            GiftSchema.find()
                .then(gifts => {
                    res.json({
                        data: giftInfo,
                        cardsInfo: gifts
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: 'Error fetching additional data' });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Error fetching gift info' });
        });
};


exports.giftUpdate = (req, res) => {
    GiftInfoSchema.findByIdAndUpdate("6489c7239bdfd1bbc0d33afc").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteGift = (req, res) => {
    GiftInfoSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
