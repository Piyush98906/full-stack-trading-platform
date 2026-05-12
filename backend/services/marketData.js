const { STOCKS, buildStockDetailsFromStock, getStockBySymbol } = require('../data/stocks');
const {
  cacheInstrument,
  getCachedInstrument,
  getUpstoxQuotes,
  getUpstoxSeriesForRange,
  getUpstoxStatus,
  isUpstoxReady,
  searchUpstoxInstruments
} = require('./upstoxData');

const warningCache = new Set();
const chartRanges = ['1D', '1W', '1M', '6M'];
const SEARCH_CONCURRENCY = 6;

const warnOnce = (key, message) => {
  if (warningCache.has(key)) {
    return;
  }

  warningCache.add(key);
  console.warn(message);
};

const normalizeSymbol = (value) => String(value || '').trim().toUpperCase();

const normalizeExchange = (value) => String(value || 'NSE').trim().toUpperCase();

const cloneStock = (stock) => ({ ...stock });

const mapWithConcurrency = async (items, concurrency, iteratee) => {
  const results = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await iteratee(items[currentIndex], currentIndex);
    }
  };

  const workerCount = Math.min(Math.max(concurrency, 1), items.length || 1);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
};

const createExternalStock = (input = {}) => ({
  symbol: normalizeSymbol(input.symbol),
  name: input.name || normalizeSymbol(input.symbol),
  exchange: normalizeExchange(input.exchange),
  sector: input.sector || 'Equity',
  price: Number(input.price || 0),
  change: Number(input.change || 0),
  volume: Number(input.volume || 0),
  instrumentKey: input.instrumentKey || '',
  instrumentType: input.instrumentType || '',
  segment: input.segment || '',
  source: input.source || 'upstox'
});

const mergeStockMetadata = (baseStock, overlay = {}) => ({
  ...baseStock,
  ...overlay,
  symbol: overlay.symbol || baseStock.symbol,
  name: baseStock.name || overlay.name || baseStock.symbol,
  exchange: overlay.exchange || baseStock.exchange || 'NSE',
  sector: baseStock.sector || overlay.sector || 'Equity',
  price: Number(overlay.price ?? baseStock.price ?? 0),
  change: Number(overlay.change ?? baseStock.change ?? 0),
  volume: Number(overlay.volume ?? baseStock.volume ?? 0),
  instrumentKey: overlay.instrumentKey || baseStock.instrumentKey || '',
  instrumentType: overlay.instrumentType || baseStock.instrumentType || '',
  segment: overlay.segment || baseStock.segment || '',
  source: overlay.source || baseStock.source || 'seeded'
});

const getBaseStock = (input = {}) => {
  const localStock = getStockBySymbol(input.symbol);

  if (localStock) {
    return mergeStockMetadata(cloneStock(localStock), input.instrumentKey ? { instrumentKey: input.instrumentKey } : {});
  }

  if (!input.symbol) {
    return null;
  }

  return createExternalStock(input);
};

const scoreInstrumentMatch = (instrument, target) => {
  const targetSymbol = normalizeSymbol(target.symbol);
  const targetExchange = normalizeExchange(target.exchange);
  const targetName = String(target.name || '').trim().toLowerCase();

  let score = 0;

  if (normalizeSymbol(instrument.symbol) === targetSymbol) {
    score += 50;
  }

  if (normalizeExchange(instrument.exchange) === targetExchange) {
    score += 20;
  }

  if (targetName && String(instrument.name || '').toLowerCase() === targetName) {
    score += 15;
  }

  if (targetName && String(instrument.name || '').toLowerCase().includes(targetName)) {
    score += 5;
  }

  if (instrument.sector === 'Index' && target.sector === 'Index') {
    score += 5;
  }

  return score;
};

const pickBestInstrument = (matches, target) =>
  [...matches].sort((left, right) => scoreInstrumentMatch(right, target) - scoreInstrumentMatch(left, target))[0] || null;

const resolveInstrumentForStock = async (stock, { allowSearch = true } = {}) => {
  if (!stock) {
    return null;
  }

  if (stock.instrumentKey) {
    cacheInstrument(stock);
    return stock;
  }

  const cached = getCachedInstrument(stock);

  if (cached) {
    return mergeStockMetadata(stock, cached);
  }

  if (!allowSearch || !isUpstoxReady()) {
    return stock;
  }

  const searchQuery = stock.symbol || stock.name;
  const results = await searchUpstoxInstruments(searchQuery, { records: 10 });
  const bestMatch = pickBestInstrument(results, stock);

  return bestMatch ? mergeStockMetadata(stock, bestMatch) : stock;
};

const resolveStockInput = async (input = {}, options = {}) => {
  const baseStock = getBaseStock(input);

  if (!baseStock) {
    return null;
  }

  return resolveInstrumentForStock(baseStock, options);
};

const mergeQuoteIntoStock = (stock, quote) => {
  if (!quote || !quote.lastPrice) {
    return cloneStock(stock);
  }

  return {
    ...stock,
    change: Number(quote.changePercent ?? stock.change ?? 0),
    price: Number(quote.lastPrice ?? stock.price ?? 0),
    volume: Number(quote.volume ?? stock.volume ?? 0),
    instrumentKey: quote.instrumentKey || stock.instrumentKey || '',
    source: 'upstox'
  };
};

const getLiveQuoteForStock = async (stock, { allowSearch = true } = {}) => {
  const resolvedStock = await resolveStockInput(stock, { allowSearch });

  if (!resolvedStock?.instrumentKey) {
    if (!isUpstoxReady()) {
      warnOnce('upstox-disabled-single', 'Upstox market data is not configured. Using seeded stock prices.');
    }

    return null;
  }

  const quotesByKey = await getUpstoxQuotes([resolvedStock.instrumentKey]);
  return quotesByKey.get(resolvedStock.instrumentKey) || null;
};

const enrichStocksWithLiveQuotes = async (stocks, { allowSearch } = {}) => {
  if (!Array.isArray(stocks) || stocks.length === 0) {
    return [];
  }

  const shouldSearch = allowSearch ?? stocks.length <= 12;
  const resolvedStocks = await mapWithConcurrency(
    stocks,
    shouldSearch ? SEARCH_CONCURRENCY : stocks.length,
    (stock) => resolveStockInput(stock, { allowSearch: shouldSearch })
  );
  const instrumentKeys = [...new Set(resolvedStocks.map((stock) => stock?.instrumentKey).filter(Boolean))];

  if (instrumentKeys.length === 0) {
    if (!isUpstoxReady()) {
      warnOnce('upstox-disabled-list', 'Upstox market data is not configured. Using seeded stock prices.');
    }

    return resolvedStocks.map((stock) => cloneStock(stock));
  }

  const quotesByKey = await getUpstoxQuotes(instrumentKeys);

  return resolvedStocks.map((stock) => mergeQuoteIntoStock(stock, quotesByKey.get(stock.instrumentKey)));
};

const dedupeStocks = (stocks) => {
  const uniqueStocks = new Map();

  for (const stock of stocks) {
    const key = stock.instrumentKey || `${normalizeSymbol(stock.symbol)}::${normalizeExchange(stock.exchange)}`;

    if (!uniqueStocks.has(key)) {
      uniqueStocks.set(key, stock);
    }
  }

  return [...uniqueStocks.values()];
};

const searchStocks = async (query) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  if (!normalizedQuery) {
    return enrichStocksWithLiveQuotes(STOCKS.slice(0, 12), { allowSearch: true });
  }

  const localMatches = STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(normalizedQuery) ||
      stock.name.toLowerCase().includes(normalizedQuery)
  );

  const externalMatches = isUpstoxReady()
    ? await searchUpstoxInstruments(query, { records: 12 })
    : [];

  const combined = dedupeStocks([...localMatches.map(cloneStock), ...externalMatches]).slice(0, 12);

  return enrichStocksWithLiveQuotes(combined, { allowSearch: true });
};

const getLivePerformanceForStock = async (stock) => {
  if (!stock?.instrumentKey || !isUpstoxReady()) {
    return null;
  }

  const results = await Promise.all(chartRanges.map((range) => getUpstoxSeriesForRange(stock.instrumentKey, range)));
  const performance = {};

  chartRanges.forEach((range, index) => {
    if (results[index]) {
      performance[range] = results[index];
    }
  });

  return Object.keys(performance).length > 0 ? performance : null;
};

const buildStockDetailsPayload = async (input = {}) => {
  const resolvedStock = await resolveStockInput(input, { allowSearch: true });

  if (!resolvedStock || !resolvedStock.instrumentKey || !isUpstoxReady()) {
    return null;
  }

  const liveQuote = await getLiveQuoteForStock(resolvedStock, { allowSearch: false });

  if (!liveQuote) {
    return null;
  }

  const liveStock = mergeQuoteIntoStock(resolvedStock, liveQuote);
  const details = buildStockDetailsFromStock(liveStock);
  const livePerformance = await getLivePerformanceForStock(liveStock);

  if (livePerformance) {
    details.performance = {
      ...details.performance,
      ...livePerformance
    };
  }

  details.stats = {
    ...details.stats,
    lowerCircuit: liveQuote.lowerCircuitLimit || details.stats.lowerCircuit,
    previousClose: liveQuote.previousClose || details.stats.previousClose,
    todayHigh: liveQuote.high || details.stats.todayHigh,
    todayLow: liveQuote.low || details.stats.todayLow,
    upperCircuit: liveQuote.upperCircuitLimit || details.stats.upperCircuit
  };

  return details;
};

const getMarketDataStatus = () => getUpstoxStatus();

module.exports = {
  buildStockDetailsPayload,
  enrichStocksWithLiveQuotes,
  getLiveQuoteForStock,
  getMarketDataStatus,
  mergeQuoteIntoStock,
  resolveStockInput,
  searchStocks
};
