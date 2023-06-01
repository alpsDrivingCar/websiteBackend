const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const postCodeSchema = new Schema({
    title: String,
    parentPostcode: String,
    description: String,
    typeOfLesson: [
        {
            slug: String,
            title: String,
        },
    ]
});


// Create a model based on that schema
const PostCode = mongoose.model("lessons", postCodeSchema);

module.exports = PostCode

