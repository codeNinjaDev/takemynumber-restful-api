const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    brand: { type: String, required: true },
    location: { type: [Number], required: true },
    maxOccupants: { type: Number, required: true },
    currentOccupants: { type: Number, required: true },
    userQueue: { type: Number, required: true },
    numberUp: { type: Number, required: true },
    vendorImage: { type: String, required: false }
});

module.exports = mongoose.model('Vendor', vendorSchema);