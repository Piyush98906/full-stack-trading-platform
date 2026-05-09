const express = require('express');
const Holding = require('../models/Holding');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.user._id }).sort({ name: 1 });
    return res.json({ holdings });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch holdings' });
  }
});

module.exports = router;
