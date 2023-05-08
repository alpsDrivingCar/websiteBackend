const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const gymSchema = new Schema({
    number: Number,
    gymName: String,
    email: String,
});

// Create a model based on that schema
const Gym = mongoose.model("Gym", gymSchema);

module.exports = Gym