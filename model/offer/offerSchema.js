const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const offerSchema = new Schema({
    title: String,
    typeOffer: [{
        title: String,
        offers: [
            {
                icon: String,
                title: String,
                price: String,
                typeLessonId:String,
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

