const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const franchiseSchema = new Schema({
    email: String,
    phoneNumber: String,
    location: String,
    name: String
}, {
    timestamps: true,
});


// Create a model based on that schema
const Franchise = mongoose.model("franchise", franchiseSchema);

module.exports = Franchise

