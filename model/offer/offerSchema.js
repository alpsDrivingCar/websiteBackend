const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const offerSchema = new Schema({
    title: String,
    typeOffer: [{
        title: String,
        offers: [
            {
                packageId:{
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'bookingPackage',
                },
                icon: String,
                title: String,
                price: String,
                offerFeature: [
                    {
                        name: String
                    }
                ]
            }
        ]
    }]
});


// Create a model based on that schema
const Offer = mongoose.model("offers", offerSchema);

module.exports = Offer

