const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const aboutusSchema = new Schema({
    aboutus: [{
        title: String,
        image: { type: String, required: false },  // Explicitly set as optional
        description: String,
    }]
});

// Create a model based on that schema
const Aboutus = mongoose.model("aboutus", aboutusSchema);

module.exports = Aboutus



