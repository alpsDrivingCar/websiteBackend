const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const infoInstructorsSchema = new Schema({
    name: String,
    phoneNumber:String,
    email:String,
    address:String,
    dateOfBirth:String
});


// Create a model based on that schema
const PostCode = mongoose.model("info", infoInstructorsSchema);

module.exports = PostCode

