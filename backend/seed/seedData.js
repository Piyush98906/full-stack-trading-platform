require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Holding = require('../models/Holding');
const Order = require('../models/Order');
const Position = require('../models/Position');
const User = require('../models/User');

const holdingsSeed = [
  { name: 'RELIANCE', qty: 5, avg: 2805, price: 2962, net: '+5.60%', day: '+1.09%', isLoss: false, sector: 'Energy', exchange: 'NSE' },
  { name: 'TCS', qty: 3, avg: 3245, price: 3490, net: '+7.55%', day: '+0.84%', isLoss: false, sector: 'IT', exchange: 'NSE' },
  { name: 'INFY', qty: 10, avg: 1402, price: 1510, net: '+7.70%', day: '+1.23%', isLoss: false, sector: 'IT', exchange: 'NSE' },
  { name: 'HDFCBANK', qty: 8, avg: 1682, price: 1590, net: '-5.47%', day: '-0.55%', isLoss: true, sector: 'Banking', exchange: 'NSE' },
  { name: 'WIPRO', qty: 20, avg: 442, price: 430, net: '-2.71%', day: '-0.22%', isLoss: true, sector: 'IT', exchange: 'NSE' },
  { name: 'SBIN', qty: 15, avg: 598, price: 624, net: '+4.35%', day: '+1.62%', isLoss: false, sector: 'Banking', exchange: 'NSE' },
  { name: 'MARUTI', qty: 2, avg: 10420, price: 10848, net: '+4.11%', day: '+0.47%', isLoss: false, sector: 'Auto', exchange: 'NSE' },
  { name: 'BAJFINANCE', qty: 4, avg: 6820, price: 7210, net: '+5.72%', day: '+0.98%', isLoss: false, sector: 'Finance', exchange: 'NSE' },
  { name: 'HCLTECH', qty: 12, avg: 1165, price: 1198, net: '+2.83%', day: '+0.63%', isLoss: false, sector: 'IT', exchange: 'NSE' },
  { name: 'ICICIBANK', qty: 10, avg: 952, price: 1024, net: '+7.56%', day: '+1.44%', isLoss: false, sector: 'Banking', exchange: 'NSE' },
  { name: 'LTIM', qty: 3, avg: 5240, price: 5010, net: '-4.39%', day: '-1.02%', isLoss: true, sector: 'IT', exchange: 'NSE' },
  { name: 'TITAN', qty: 5, avg: 3102, price: 3285, net: '+5.90%', day: '+0.72%', isLoss: false, sector: 'Consumer', exchange: 'NSE' }
];

const positionsSeed = [
  { product: 'MIS', name: 'TATAMOTORS', qty: 25, avg: 988, price: 1012, net: '+2.43%', day: '+1.76%', isLoss: false, exchange: 'NSE' },
  { product: 'NRML', name: 'AXISBANK', qty: 18, avg: 1184, price: 1168, net: '-1.35%', day: '+0.49%', isLoss: true, exchange: 'NSE' },
  { product: 'MIS', name: 'TECHM', qty: 10, avg: 1278, price: 1311, net: '+2.58%', day: '+0.57%', isLoss: false, exchange: 'NSE' },
  { product: 'NRML', name: 'SUNPHARMA', qty: 9, avg: 1592, price: 1618, net: '+1.63%', day: '+0.72%', isLoss: false, exchange: 'NSE' },
  { product: 'MIS', name: 'PAYTM', qty: 30, avg: 448, price: 432, net: '-3.57%', day: '-0.88%', isLoss: true, exchange: 'NSE' }
];

const now = Date.now();
const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000);

const ordersSeed = [
  { name: 'RELIANCE', qty: 2, price: 2924, mode: 'buy', orderType: 'market', product: 'CNC', status: 'executed', exchange: 'NSE', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  { name: 'TCS', qty: 1, price: 3485, mode: 'buy', orderType: 'market', product: 'CNC', status: 'executed', exchange: 'NSE', createdAt: daysAgo(2), updatedAt: daysAgo(2) },
  { name: 'INFY', qty: 5, price: 1498, mode: 'buy', orderType: 'market', product: 'CNC', status: 'executed', exchange: 'NSE', createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  { name: 'HDFCBANK', qty: 3, price: 1602, mode: 'sell', orderType: 'limit', product: 'CNC', status: 'pending', exchange: 'NSE', createdAt: daysAgo(4), updatedAt: daysAgo(4) },
  { name: 'SBIN', qty: 10, price: 619, mode: 'buy', orderType: 'market', product: 'CNC', status: 'executed', exchange: 'NSE', createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { name: 'TATAMOTORS', qty: 20, price: 995, mode: 'buy', orderType: 'market', product: 'MIS', status: 'executed', exchange: 'NSE', createdAt: daysAgo(6), updatedAt: daysAgo(6) },
  { name: 'PAYTM', qty: 15, price: 440, mode: 'sell', orderType: 'limit', product: 'MIS', status: 'cancelled', exchange: 'NSE', createdAt: daysAgo(7), updatedAt: daysAgo(7) },
  { name: 'TITAN', qty: 2, price: 3258, mode: 'buy', orderType: 'market', product: 'CNC', status: 'executed', exchange: 'NSE', createdAt: daysAgo(8), updatedAt: daysAgo(8) },
  { name: 'HCLTECH', qty: 5, price: 1189, mode: 'buy', orderType: 'market', product: 'CNC', status: 'executed', exchange: 'NSE', createdAt: daysAgo(9), updatedAt: daysAgo(9) },
  { name: 'ICICIBANK', qty: 4, price: 1010, mode: 'buy', orderType: 'market', product: 'CNC', status: 'executed', exchange: 'NSE', createdAt: daysAgo(10), updatedAt: daysAgo(10) }
];

const seedData = async () => {
  await connectDB();

  try {
    await Promise.all([
      Holding.deleteMany({}),
      Position.deleteMany({}),
      Order.deleteMany({}),
      User.deleteMany({})
    ]);

    const adminUser = await User.create({
      name: 'Platform Admin',
      email: 'admin@tradingplatform.in',
      password: 'Admin@123',
      role: 'admin',
      avatar: 'A',
      funds: 250000,
      fundsTransactions: [
        {
          type: 'credit',
          method: 'Seed Wallet',
          amount: 250000,
          status: 'success',
          reference: 'ADMIN-SEED'
        }
      ]
    });

    const demoUser = await User.create({
      name: 'Demo Trader',
      email: 'demo@tradingplatform.in',
      password: 'Demo@123',
      role: 'user',
      avatar: 'D',
      funds: 100000,
      phone: '9876543210',
      pan: 'ABCDE1234F',
      fundsTransactions: [
        {
          type: 'credit',
          method: 'Seed Wallet',
          amount: 100000,
          status: 'success',
          reference: 'DEMO-SEED'
        }
      ]
    });

    await Holding.insertMany(holdingsSeed.map((holding) => ({ ...holding, userId: demoUser._id })));
    await Position.insertMany(positionsSeed.map((position) => ({ ...position, userId: demoUser._id })));
    await Order.insertMany(ordersSeed.map((order) => ({ ...order, userId: demoUser._id })));

    console.log('Seed completed successfully');
    console.log(`Admin user: ${adminUser.email} / Admin@123`);
    console.log(`Demo user: ${demoUser.email} / Demo@123`);
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seedData();
