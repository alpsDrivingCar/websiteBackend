const mongoose = require('mongoose');

const AddressCacheSchema = new mongoose.Schema({
    postcode: { type: String, required: true, unique: true, index: true },
    rawResponse: { type: mongoose.Schema.Types.Mixed, required: true },
    summaryLines: [String],
    fetchedAt: { type: Date, default: Date.now, index: { expires: 60 * 60 * 24 * 30 } },
    hitCount: { type: Number, default: 0 }
});

const AddressCache = mongoose.model('AddressCache', AddressCacheSchema);

module.exports = AddressCache;
