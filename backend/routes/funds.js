const express = require('express');
const Position = require('../models/Position');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const calculateUsedMargin = (positions) =>
  Number(
    positions
      .reduce((sum, position) => sum + (position.qty * position.price * 0.2), 0)
      .toFixed(2)
  );

router.get('/', protect, async (req, res) => {
  try {
    const [user, positions] = await Promise.all([
      User.findById(req.user._id),
      Position.find({ userId: req.user._id })
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const available = user.funds;
    const collateral = 0;
    const used = calculateUsedMargin(positions);
    const total = Number((available + collateral).toFixed(2));

    return res.json({
      available,
      collateral,
      used,
      total,
      transactions: [...user.fundsTransactions].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch funds data' });
  }
});

router.post('/add', protect, async (req, res) => {
  try {
    const { amount, method = 'UPI', upiId } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount to add' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.funds = Number((user.funds + parsedAmount).toFixed(2));
    user.fundsTransactions.push({
      type: 'credit',
      method: upiId ? `${method} (${upiId})` : method,
      amount: parsedAmount,
      status: 'success',
      reference: `ADD-${Date.now()}`
    });

    await user.save();

    return res.status(201).json({
      message: 'Funds added successfully',
      funds: user.funds
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add funds' });
  }
});

router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount to withdraw' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.funds < parsedAmount) {
      return res.status(400).json({ message: 'Insufficient available cash' });
    }

    user.funds = Number((user.funds - parsedAmount).toFixed(2));
    user.fundsTransactions.push({
      type: 'debit',
      method: 'Withdrawal',
      amount: parsedAmount,
      status: 'success',
      reference: `WDR-${Date.now()}`
    });

    await user.save();

    return res.status(201).json({
      message: 'Withdrawal successful',
      funds: user.funds
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to withdraw funds' });
  }
});

module.exports = router;
