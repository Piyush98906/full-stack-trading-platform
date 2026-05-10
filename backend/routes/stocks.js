const express = require('express');
const { STOCKS } = require('../data/stocks');
const { protect } = require('../middleware/auth');
const {
  buildStockDetailsPayload,
  enrichStocksWithLiveQuotes,
  getLiveQuoteForStock,
  getMarketDataStatus,
  mergeQuoteIntoStock,
  resolveStockInput,
  searchStocks
} = require('../services/marketData');

const router = express.Router();

router.get('/search', protect, async (req, res) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();

    if (!query) {
      return res.json({ stocks: await enrichStocksWithLiveQuotes(STOCKS.slice(0, 12), { allowSearch: true }) });
    }

    return res.json({ stocks: await searchStocks(query) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to search stocks' });
  }
});

router.get('/provider-status', protect, (req, res) => {
  return res.json(getMarketDataStatus());
});

router.get('/market-overview', protect, async (req, res) => {
  try {
    const liveStocks = await enrichStocksWithLiveQuotes(STOCKS, { allowSearch: false });
    const equities = liveStocks.filter((stock) => stock.sector !== 'Index');
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
      indices: liveStocks.filter((stock) => stock.sector === 'Index')
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch market overview' });
  }
});

router.get('/quote/:symbol', protect, async (req, res) => {
  try {
    const stock = await resolveStockInput({
      symbol: req.params.symbol,
      instrumentKey: req.query.instrumentKey,
      exchange: req.query.exchange,
      name: req.query.name,
      sector: req.query.sector
    });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const liveQuote = await getLiveQuoteForStock(stock, { allowSearch: false });

    return res.json({
      stock: mergeQuoteIntoStock(stock, liveQuote)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stock quote' });
  }
});

router.get('/details/:symbol', protect, async (req, res) => {
  try {
    const details = await buildStockDetailsPayload({
      symbol: req.params.symbol,
      instrumentKey: req.query.instrumentKey,
      exchange: req.query.exchange,
      name: req.query.name,
      sector: req.query.sector
    });

    if (!details) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    return res.json(details);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stock details' });
  }
});

module.exports = router;
