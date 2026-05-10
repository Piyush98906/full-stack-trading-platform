const express = require('express');
const Holding = require('../models/Holding');
const Order = require('../models/Order');
const Position = require('../models/Position');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getLiveQuoteForStock, resolveStockInput } = require('../services/marketData');

const router = express.Router();

const toSignedPercent = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

const isMarketOpen = () => {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short'
  }).format(now);
  const timeParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }).formatToParts(now);
  const hour = Number(timeParts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(timeParts.find((part) => part.type === 'minute')?.value || 0);
  const totalMinutes = hour * 60 + minute;
  const openMinutes = 9 * 60 + 15;
  const closeMinutes = 15 * 60 + 30;

  return !['Sat', 'Sun'].includes(weekday) && totalMinutes >= openMinutes && totalMinutes <= closeMinutes;
};

const quoteFromStock = async (stock) => {
  const liveQuote = await getLiveQuoteForStock(stock);

  if (liveQuote?.lastPrice) {
    return {
      ...stock,
      day: liveQuote.changePercent,
      price: liveQuote.lastPrice
    };
  }

  const noiseFactor = 1 + (Math.random() - 0.5) / 100;
  const price = Number((stock.price * noiseFactor).toFixed(2));
  const day = Number((stock.change + (Math.random() - 0.5) * 0.35).toFixed(2));

  return {
    ...stock,
    price,
    day
  };
};

const recomputePerformance = (avg, currentPrice, dayChange) => {
  const netNumber = ((currentPrice - avg) / avg) * 100;
  return {
    net: toSignedPercent(netNumber),
    day: toSignedPercent(dayChange),
    isLoss: netNumber < 0
  };
};

const upsertHolding = async ({ userId, symbol, qty, executionPrice, exchange, sector, dayChange }) => {
  const existingHolding = await Holding.findOne({ userId, name: symbol });
  const quote = recomputePerformance(executionPrice, executionPrice, dayChange);

  if (!existingHolding) {
    return Holding.create({
      userId,
      name: symbol,
      qty,
      avg: executionPrice,
      price: executionPrice,
      sector,
      exchange,
      ...quote
    });
  }

  const newQty = existingHolding.qty + qty;
  const newAvg = ((existingHolding.avg * existingHolding.qty) + (executionPrice * qty)) / newQty;
  const performance = recomputePerformance(newAvg, executionPrice, dayChange);

  existingHolding.qty = newQty;
  existingHolding.avg = Number(newAvg.toFixed(2));
  existingHolding.price = executionPrice;
  existingHolding.net = performance.net;
  existingHolding.day = performance.day;
  existingHolding.isLoss = performance.isLoss;
  existingHolding.exchange = exchange;
  existingHolding.sector = sector;
  await existingHolding.save();
  return existingHolding;
};

const reduceHolding = async ({ userId, symbol, qty, executionPrice, dayChange }) => {
  const holding = await Holding.findOne({ userId, name: symbol });

  if (!holding || holding.qty < qty) {
    throw new Error('Insufficient holding quantity for sell order');
  }

  holding.qty -= qty;
  const performance = recomputePerformance(holding.avg, executionPrice, dayChange);
  holding.price = executionPrice;
  holding.net = performance.net;
  holding.day = performance.day;
  holding.isLoss = performance.isLoss;

  if (holding.qty === 0) {
    await holding.deleteOne();
    return null;
  }

  await holding.save();
  return holding;
};

const upsertPosition = async ({ userId, symbol, qty, executionPrice, exchange, product, dayChange }) => {
  const existingPosition = await Position.findOne({ userId, name: symbol, product });
  const quote = recomputePerformance(executionPrice, executionPrice, dayChange);

  if (!existingPosition) {
    return Position.create({
      userId,
      name: symbol,
      qty,
      avg: executionPrice,
      price: executionPrice,
      exchange,
      product,
      ...quote
    });
  }

  const newQty = existingPosition.qty + qty;
  const newAvg = ((existingPosition.avg * existingPosition.qty) + (executionPrice * qty)) / newQty;
  const performance = recomputePerformance(newAvg, executionPrice, dayChange);

  existingPosition.qty = newQty;
  existingPosition.avg = Number(newAvg.toFixed(2));
  existingPosition.price = executionPrice;
  existingPosition.net = performance.net;
  existingPosition.day = performance.day;
  existingPosition.isLoss = performance.isLoss;
  await existingPosition.save();
  return existingPosition;
};

const reducePosition = async ({ userId, symbol, qty, executionPrice, product, dayChange }) => {
  const position = await Position.findOne({ userId, name: symbol, product });

  if (!position || position.qty < qty) {
    throw new Error('Insufficient position quantity for sell order');
  }

  position.qty -= qty;
  const performance = recomputePerformance(position.avg, executionPrice, dayChange);
  position.price = executionPrice;
  position.net = performance.net;
  position.day = performance.day;
  position.isLoss = performance.isLoss;

  if (position.qty === 0) {
    await position.deleteOne();
    return null;
  }

  await position.save();
  return position;
};

router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.post('/new', protect, async (req, res) => {
  try {
    const {
      name,
      qty,
      price,
      mode,
      orderType = 'market',
      product = 'CNC',
      instrumentKey,
      exchange,
      companyName,
      sector
    } = req.body;

    if (!name || !qty || !mode) {
      return res.status(400).json({ message: 'Name, quantity, and mode are required' });
    }

    const normalizedQty = Number(qty);
    const stock = await resolveStockInput({
      symbol: name,
      instrumentKey,
      exchange,
      name: companyName,
      sector
    });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const liveQuote = await quoteFromStock(stock);
    const executionPrice = Number(price || liveQuote.price);

    if (!Number.isFinite(executionPrice) || executionPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const marketOpen = isMarketOpen();
    const status = marketOpen && orderType === 'market' ? 'executed' : 'pending';
    const total = Number((executionPrice * normalizedQty).toFixed(2));

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (status === 'executed' && mode === 'buy' && user.funds < total) {
      return res.status(400).json({ message: 'Insufficient available funds' });
    }

    if (status === 'executed') {
      if (mode === 'buy') {
        user.funds = Number((user.funds - total).toFixed(2));

        if (product === 'CNC') {
          await upsertHolding({
            userId: user._id,
            symbol: stock.symbol,
            qty: normalizedQty,
            executionPrice,
            exchange: stock.exchange,
            sector: stock.sector,
            dayChange: liveQuote.day
          });
        } else {
          await upsertPosition({
            userId: user._id,
            symbol: stock.symbol,
            qty: normalizedQty,
            executionPrice,
            exchange: stock.exchange,
            product,
            dayChange: liveQuote.day
          });
        }
      } else {
        if (product === 'CNC') {
          await reduceHolding({
            userId: user._id,
            symbol: stock.symbol,
            qty: normalizedQty,
            executionPrice,
            dayChange: liveQuote.day
          });
        } else {
          await reducePosition({
            userId: user._id,
            symbol: stock.symbol,
            qty: normalizedQty,
            executionPrice,
            product,
            dayChange: liveQuote.day
          });
        }

        user.funds = Number((user.funds + total).toFixed(2));
      }

      user.fundsTransactions.push({
        type: mode === 'buy' ? 'debit' : 'credit',
        method: `${product} order`,
        amount: total,
        status: 'success',
        reference: `${stock.symbol}-${Date.now()}`
      });

      await user.save();
    }

    const order = await Order.create({
      name: stock.symbol,
      qty: normalizedQty,
      price: executionPrice,
      mode,
      orderType,
      product,
      status,
      exchange: stock.exchange,
      userId: user._id
    });

    return res.status(201).json({
      message:
        status === 'executed'
          ? 'Order placed successfully'
          : marketOpen
            ? 'Order placed in pending status'
            : 'Market is closed. Your order has been placed in pending status.',
      order
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to place order' });
  }
});

module.exports = router;
