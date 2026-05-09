const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  product: { type: String, enum: ['MIS', 'CNC', 'NRML'], required: true },
  name: { type: String, required: true, trim: true },
  qty: { type: Number, required: true },
  avg: { type: Number, required: true },
  price: { type: Number, required: true },
  net: { type: String, required: true },
  day: { type: String, required: true },
  isLoss: { type: Boolean, default: false },
  exchange: { type: String, default: 'NSE' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Position', positionSchema);
