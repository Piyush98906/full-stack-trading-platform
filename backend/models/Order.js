const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    mode: { type: String, enum: ['buy', 'sell'], required: true },
    orderType: { type: String, enum: ['market', 'limit', 'sl'], default: 'market' },
    product: { type: String, enum: ['MIS', 'CNC', 'NRML'], default: 'CNC' },
    status: { type: String, enum: ['executed', 'pending', 'cancelled'], default: 'executed' },
    exchange: { type: String, default: 'NSE' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
