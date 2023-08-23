const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const aboutUsSchema = new Schema({
    title: String,
    typeAboutus: [{
        title: String,
        aboutuss: [
            {
                icon: String,
                title: String,
                price: String,
                aboutusFeature: [
                    {
                        name: String
                    }
                ]
            }
        ]
    }]
});


// Create a model based on that schema
const Aboutus = mongoose.model("aboutuss", aboutUsSchema);

module.exports = Aboutus

