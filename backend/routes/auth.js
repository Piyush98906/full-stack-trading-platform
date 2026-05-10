const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getUpstoxStatus } = require('../services/upstoxData');

const router = express.Router();
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  pan: user.pan,
  avatar: user.avatar,
  funds: user.funds,
  createdAt: user.createdAt
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, pan } = req.body;
    const normalizedPan = String(pan || '').trim().toUpperCase();

    if (!name || !email || !password || !normalizedPan) {
      return res.status(400).json({ message: 'Name, email, PAN number, and password are required' });
    }

    if (!panPattern.test(normalizedPan)) {
      return res.status(400).json({ message: 'PAN number must be in the format ABCDE1234F' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      pan: normalizedPan,
      password,
      avatar: name.trim().charAt(0).toUpperCase()
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login' });
  }
});

router.get('/me', protect, async (req, res) => {
  return res.json({ user: req.user });
});

router.get('/upstox/status', (req, res) => {
  return res.json(getUpstoxStatus());
});

module.exports = router;
