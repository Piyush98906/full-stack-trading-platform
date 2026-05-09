const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments({ userId: req.user._id });
    return res.json({
      profile: {
        ...req.user.toObject(),
        ordersCount
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

router.put('/', protect, async (req, res) => {
  try {
    const { name, phone, pan } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) {
      user.name = name.trim();
      user.avatar = name.trim().charAt(0).toUpperCase();
    }

    user.phone = phone || '';
    user.pan = pan ? pan.toUpperCase() : '';

    await user.save();

    return res.json({
      message: 'Profile updated successfully',
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        pan: user.pan,
        avatar: user.avatar,
        funds: user.funds,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to change password' });
  }
});

module.exports = router;
