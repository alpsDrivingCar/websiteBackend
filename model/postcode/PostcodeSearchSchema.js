const mongoose = require('mongoose');

const PostcodeSearchSchema = new mongoose.Schema({
    postcodeExisting: [{
        name: String,
        searchCount: { type: Number, default: 1 }
    }],
    postcodeNotExisting: [{
        name: String,
        searchCount: { type: Number, default: 1 }
    }]
});

const PostcodeSearch = mongoose.model('PostcodeSearch', PostcodeSearchSchema);

module.exports = PostcodeSearch;
