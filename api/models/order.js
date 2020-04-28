const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    orderNumber: { type: mongoose.Schema.Types.Number, required: true },
    called: { type: mongoose.Schema.Types.Boolean, default: false },

});

module.exports = mongoose.model('Order', orderSchema);