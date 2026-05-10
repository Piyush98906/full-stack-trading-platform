const MARKET_DATA_API_BASE_URL =
  String(process.env.MARKET_DATA_API_BASE_URL || 'https://nse-api-ruby.vercel.app').replace(/\/+$/, '');

const warningCache = new Set();

const warnOnce = (key, message) => {
  if (warningCache.has(key)) {
    return;
  }

  warningCache.add(key);
  console.warn(message);
};

const getProviderSymbol = (stock) => {
  const symbol = typeof stock === 'string' ? stock : stock.symbol;
  const exchange = typeof stock === 'string' ? 'NSE' : stock.exchange;

  if (String(symbol).includes('.NS') || String(symbol).includes('.BO')) {
    return symbol;
  }

  return exchange === 'BSE' ? `${symbol}.BO` : `${symbol}.NS`;
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok || data?.status === 'error') {
    const message = data?.message || `Market data request failed with ${response.status}`;
    throw new Error(message);
  }

  return data;
};

const toQuote = (providerStock) => {
  if (!providerStock) {
    return null;
  }

  return {
    changeAbsolute: Number(providerStock.change || 0),
    changePercent: Number(providerStock.percent_change || 0),
    high: Number(providerStock.day_high || 0),
    lastPrice: Number(providerStock.last_price || 0),
    low: Number(providerStock.day_low || 0),
    marketCap: Number(providerStock.market_cap || 0),
    open: Number(providerStock.open || 0),
    peRatio: Number(providerStock.pe_ratio || 0),
    previousClose: Number(providerStock.previous_close || 0),
    sector: providerStock.sector || '',
    symbol: providerStock.symbol || '',
    volume: Number(providerStock.volume || 0),
    week52High: Number(providerStock.year_high || 0),
    week52Low: Number(providerStock.year_low || 0)
  };
};

const mergeQuoteIntoStock = (stock, quote) => {
  if (!quote || !quote.lastPrice) {
    return stock;
  }

  return {
    ...stock,
    change: quote.changePercent,
    price: quote.lastPrice
  };
};

const getLiveQuotesForStocks = async (stocks) => {
  const quotesBySymbol = new Map();

  if (!Array.isArray(stocks) || stocks.length === 0) {
    return quotesBySymbol;
  }

  const providerSymbols = stocks.map((stock) => getProviderSymbol(stock));
  const params = new URLSearchParams({
    res: 'num',
    symbols: providerSymbols.join(',')
  });

  try {
    const data = await fetchJson(`${MARKET_DATA_API_BASE_URL}/stock/list?${params.toString()}`);

    for (const providerStock of data?.stocks || []) {
      const normalizedSymbol = String(providerStock.symbol || '').replace(/\.(NS|BO)$/i, '');
      quotesBySymbol.set(normalizedSymbol, toQuote(providerStock));
    }
  } catch (error) {
    warnOnce('market-data-list', `Market data fallback active: ${error.message}`);
  }

  return quotesBySymbol;
};

const enrichStocksWithLiveQuotes = async (stocks) => {
  const quotesBySymbol = await getLiveQuotesForStocks(stocks);

  return stocks.map((stock) => mergeQuoteIntoStock(stock, quotesBySymbol.get(stock.symbol)));
};

const getLiveQuoteForStock = async (stock) => {
  const params = new URLSearchParams({
    res: 'num',
    symbol: getProviderSymbol(stock)
  });

  try {
    const data = await fetchJson(`${MARKET_DATA_API_BASE_URL}/stock?${params.toString()}`);
    return toQuote(data?.data);
  } catch (error) {
    warnOnce(`market-data-single-${stock.symbol}`, `Single stock fallback active for ${stock.symbol}: ${error.message}`);
    return null;
  }
};

module.exports = {
  enrichStocksWithLiveQuotes,
  getLiveQuoteForStock,
  getProviderSymbol,
  mergeQuoteIntoStock,
  toQuote
};
