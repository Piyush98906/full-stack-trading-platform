const express = require('express');
const Position = require('../models/Position');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const positions = await Position.find({ userId: req.user._id }).sort({ name: 1 });
    return res.json({ positions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch positions' });
  }
});

module.exports = router;
