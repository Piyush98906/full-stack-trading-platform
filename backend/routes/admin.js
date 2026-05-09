const express = require('express');
const Holding = require('../models/Holding');
const Order = require('../models/Order');
const Position = require('../models/Position');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  try {
    const [orders, holdings, positions, users] = await Promise.all([
      Order.countDocuments(),
      Holding.countDocuments(),
      Position.countDocuments(),
      User.countDocuments()
    ]);

    return res.json({ orders, holdings, positions, users });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch all orders' });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const allowedFields = ['qty', 'price', 'mode', 'orderType', 'product', 'status', 'exchange'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('userId', 'name email role');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order' });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete order' });
  }
});

router.get('/holdings', async (req, res) => {
  try {
    const holdings = await Holding.find().populate('userId', 'name email');
    return res.json({ holdings });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch holdings' });
  }
});

router.post('/holdings', async (req, res) => {
  try {
    const holding = await Holding.create(req.body);
    return res.status(201).json({ message: 'Holding created successfully', holding });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create holding' });
  }
});

router.put('/holdings/:id', async (req, res) => {
  try {
    const holding = await Holding.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!holding) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    return res.json({ message: 'Holding updated successfully', holding });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update holding' });
  }
});

router.delete('/holdings/:id', async (req, res) => {
  try {
    const holding = await Holding.findByIdAndDelete(req.params.id);

    if (!holding) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    return res.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete holding' });
  }
});

router.get('/positions', async (req, res) => {
  try {
    const positions = await Position.find().populate('userId', 'name email');
    return res.json({ positions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch positions' });
  }
});

router.delete('/positions/:id', async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);

    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }

    return res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete position' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
