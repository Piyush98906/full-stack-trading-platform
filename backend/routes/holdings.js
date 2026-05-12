const express = require('express');
const Holding = require('../models/Holding');
const { protect } = require('../middleware/auth');
const { enrichStocksWithLiveQuotes } = require('../services/marketData');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.user._id }).sort({ name: 1 });
    const quoteInputs = holdings.map((item) => ({
      symbol: item.name,
      name: item.name,
      exchange: item.exchange,
      sector: item.sector,
      price: item.price
    }));
    const liveStocks = await enrichStocksWithLiveQuotes(quoteInputs, { allowSearch: true });

    const enrichedHoldings = holdings.map((item, index) => {
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
        sector: liveStock?.sector || item.sector,
        exchange: liveStock?.exchange || item.exchange,
        instrumentKey: liveStock?.instrumentKey || '',
        source: liveStock?.source || 'seeded'
      };
    });

    return res.json({ holdings: enrichedHoldings });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch holdings' });
  }
});

module.exports = router;
