const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define the Schema (the structure of the article)
const homeSchema = new Schema({
    header: {
        title: String,
        description: String,
        videoLink: String,
        postCodeButtonText: String,
        postCodeInputText: String,
        backgroundImage: String,
    },
    whyAlps: {
        title: String,
        description: String,
        imageLink: String,
        alpsFeatures: [
            {
                icon: String,
                title: String,
                description: String,
            }
        ]
    },
    ourOffer: {
        title: String,
        description: String,
        offers: [
            {
                icon: String,
                title: String,
                price: String,
                offerFeature: [
                    {
                        name: String
                    }
                ]
            }
        ]
    },
    workProcess: {
        title: String,
        description: String,
        process: [
            {
                icon: String,
                title: String,
                description: String,

            }
        ]
    },
    ourInstructor: {
        title: String,
        description: String,
        process: [
            {
                rate: Number,
                title: String,
                description: String,
                image: String,
                name: String,
                city: String,
            }
        ]
    }, contactus: {
        title: String,
        description: String,
        aboutUs: String,
        facebookLink: String,
        instagramLink: String,
        googleLink: String,
        tiktokLink: String,
        usefulLinks: [
            {
                name: String,
                Link: String
            }
        ],
        productHelp: [
            {
                name: String,
                Link: String
            }
        ]
    },
});


// Create a model based on that schema
const Home = mongoose.model("homes", homeSchema);

module.exports = Home

