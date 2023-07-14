const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const offerSchema = new Schema({
    title: String,
    offerType: [
        {
            title: String,
            offers: [
                {
                    title: String,
                    price: String,
                    description: String,
                    icon: String,
                    offerTitle: String,
                    features: [
                        {
                            title: String,
                            icon: String,
                        }
                    ]
                }
            ]
        }
    ]
});


// Create a model based on that schema
const Offer = mongoose.model("offers", offerSchema);

module.exports = Offer

