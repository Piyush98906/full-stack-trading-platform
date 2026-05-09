const express = require('express');
const { STOCKS, getStockBySymbol, buildStockDetails } = require('../data/stocks');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', protect, async (req, res) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();

    if (!query) {
      return res.json({ stocks: STOCKS.slice(0, 12) });
    }

    const stocks = STOCKS.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
    ).slice(0, 12);

    return res.json({ stocks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to search stocks' });
  }
});

router.get('/market-overview', protect, async (req, res) => {
  try {
    const equities = STOCKS.filter((stock) => stock.sector !== 'Index');
    const rankedByGain = [...equities].sort((a, b) => b.change - a.change);
    const rankedByLoss = [...equities].sort((a, b) => a.change - b.change);
    const intraday = [...equities]
      .map((stock) => ({
        ...stock,
        turnover: Number((stock.price * (stock.symbol.length * 8500 + Math.abs(stock.change) * 10000)).toFixed(2))
      }))
      .sort((a, b) => b.turnover - a.turnover);

    return res.json({
      topGainers: rankedByGain.slice(0, 5),
      topLosers: rankedByLoss.slice(0, 5),
      topIntraday: intraday.slice(0, 6),
      indices: STOCKS.filter((stock) => stock.sector === 'Index')
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch market overview' });
  }
});

router.get('/quote/:symbol', protect, async (req, res) => {
  try {
    const stock = getStockBySymbol(req.params.symbol);

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const variation = 1 + (Math.random() - 0.5) / 100;
    const price = Number((stock.price * variation).toFixed(2));
    const change = Number((stock.change + (Math.random() - 0.5) * 0.4).toFixed(2));

    return res.json({
      stock: {
        ...stock,
        price,
        change
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stock quote' });
  }
});

router.get('/details/:symbol', protect, async (req, res) => {
  try {
    const details = buildStockDetails(req.params.symbol);

    if (!details) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    return res.json(details);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stock details' });
  }
});

module.exports = router;
