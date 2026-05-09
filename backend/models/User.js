const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    method: {
      type: String,
      default: 'wallet'
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'success'
    },
    reference: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String, default: '' },
  pan: { type: String, default: '' },
  avatar: { type: String, default: '' },
  funds: { type: Number, default: 50000 },
  fundsTransactions: [transactionSchema],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
