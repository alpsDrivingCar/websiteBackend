const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const GiftInfoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true,
    }
});

// Create a model based on that schema
const giftInfo = mongoose.model("giftInfo", GiftInfoSchema);

module.exports = giftInfo

