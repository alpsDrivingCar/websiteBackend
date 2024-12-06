const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const lessonsSchema = new Schema({
    title: String,
    description: String,
    features: [
        {
            type: String,
        }
    ],
    typeOfLesson: [
        {
            slug: String,
            title: String,
            description: String,
            image :String,
            discount_text:String,
            classDurationHours  : String,
        },
    ]
});


// Create a model based on that schema
const LessonsCode = mongoose.model("lessons", lessonsSchema);

module.exports = LessonsCode

