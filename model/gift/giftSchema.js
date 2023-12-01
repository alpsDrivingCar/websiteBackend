const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const GiftCardSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number, // or Float, depending on your system
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['trending', 'active', 'expired', 'inactive'] // Example set of statuses
    },
    image: {
        type: String, // URL or base64 string
        required: false // Set to true if the image is mandatory
    }
});




// Create a model based on that schema
const gift = mongoose.model("gifts", GiftCardSchema);

module.exports = gift

