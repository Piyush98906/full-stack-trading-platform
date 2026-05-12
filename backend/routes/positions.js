const express = require('express');
const Position = require('../models/Position');
const { protect } = require('../middleware/auth');
const { enrichStocksWithLiveQuotes } = require('../services/marketData');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const positions = await Position.find({ userId: req.user._id }).sort({ name: 1 });
    const quoteInputs = positions.map((item) => ({
      symbol: item.name,
      name: item.name,
      exchange: item.exchange,
      price: item.price
    }));
    const liveStocks = await enrichStocksWithLiveQuotes(quoteInputs, { allowSearch: true });

    const enrichedPositions = positions.map((item, index) => {
      const liveStock = liveStocks[index];
      const livePrice = Number(liveStock?.price ?? item.price);
      const storedDayChange = Number(String(item.day || '').replace('%', '')) || 0;
      const dayChange = Number(liveStock?.change ?? storedDayChange);
      const netPercent = item.avg ? ((livePrice - item.avg) / item.avg) * 100 : 0;

      return {
        ...item.toObject(),
        price: livePrice,
        day: `${dayChange >= 0 ? '+' : ''}${dayChange.toFixed(2)}%`,
        net: `${netPercent >= 0 ? '+' : ''}${netPercent.toFixed(2)}%`,
        isLoss: netPercent < 0,
        exchange: liveStock?.exchange || item.exchange,
        instrumentKey: liveStock?.instrumentKey || '',
        source: liveStock?.source || 'seeded'
      };
    });

    return res.json({ positions: enrichedPositions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch positions' });
  }
});

module.exports = router;
