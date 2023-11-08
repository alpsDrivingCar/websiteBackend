const mongoose = require("mongoose");

const subAreaSchema = new mongoose.Schema({
    name: String
}, { _id: false });

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    subAreas: [subAreaSchema]
});

const locationsArraySchema = new mongoose.Schema({
    locations: [locationSchema]
});

const Locations = mongoose.model("locations", locationsArraySchema);
module.exports = Locations;

