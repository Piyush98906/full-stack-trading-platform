const UPSTOX_BASE_URL = 'https://api.upstox.com';
const QUOTE_CACHE_TTL_MS = 5 * 1000;
const CANDLE_CACHE_TTL_MS = 60 * 1000;

const quoteCache = new Map();
const candleCache = new Map();
const instrumentCacheByKey = new Map();
const instrumentCacheBySymbol = new Map();
const warningCache = new Set();

const rangeConfig = {
  '1D': { kind: 'intraday', unit: 'minutes', interval: '10' },
  '1W': { kind: 'historical', unit: 'days', interval: '1', lookbackDays: 7 },
  '1M': { kind: 'historical', unit: 'days', interval: '1', lookbackDays: 30 },
  '6M': { kind: 'historical', unit: 'weeks', interval: '1', lookbackDays: 180 }
};

const trimValue = (value) => String(value || '').trim();

const warnOnce = (key, message) => {
  if (warningCache.has(key)) {
    return;
  }

  warningCache.add(key);
  console.warn(message);
};

const normalizeSymbol = (value) => trimValue(value).toUpperCase();

const normalizeExchange = (value) => trimValue(value || 'NSE').toUpperCase();

const getInstrumentCacheKey = ({ symbol, exchange }) => `${normalizeSymbol(symbol)}::${normalizeExchange(exchange)}`;

const getEnvToken = () => {
  const analyticsToken = trimValue(process.env.UPSTOX_ANALYTICS_TOKEN);

  if (analyticsToken) {
    return {
      token: analyticsToken,
      source: 'analytics',
      expiresAt: null,
      readOnly: true
    };
  }

  const accessToken = trimValue(process.env.UPSTOX_ACCESS_TOKEN);

  if (accessToken) {
    return {
      token: accessToken,
      source: 'env',
      expiresAt: null,
      readOnly: false
    };
  }

  return null;
};

const getTokenState = () => {
  return getEnvToken();
};

const isUpstoxReady = () => Boolean(getTokenState()?.token);

const buildJsonError = async (response) => {
  const payloadText = await response.text();

  try {
    const payload = JSON.parse(payloadText);
    return (
      payload?.errors?.[0]?.message ||
      payload?.message ||
      payload?.status_message ||
      `Upstox request failed with status ${response.status}`
    );
  } catch (error) {
    return payloadText || `Upstox request failed with status ${response.status}`;
  }
};

const fetchUpstoxJson = async (path, { method = 'GET', searchParams, headers = {}, body } = {}) => {
  const tokenState = getTokenState();

  if (!tokenState?.token) {
    throw new Error('Upstox market data is not configured');
  }

  const url = new URL(path, UPSTOX_BASE_URL);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${tokenState.token}`,
      ...headers
    },
    body
  });

  if (!response.ok) {
    throw new Error(await buildJsonError(response));
  }

  const data = await response.json();

  if (data?.status === 'error') {
    throw new Error(data?.message || 'Upstox request failed');
  }

  return data;
};

const formatDateYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getDateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateYmd(date);
};

const getUpstoxStatus = () => {
  const tokenState = getTokenState();

  return {
    configured: isUpstoxReady(),
    ready: Boolean(tokenState?.token),
    tokenSource: tokenState?.source || 'none',
    readOnly: Boolean(tokenState?.readOnly),
    expiresAt: null,
    hasAnalyticsToken: Boolean(trimValue(process.env.UPSTOX_ANALYTICS_TOKEN)),
    hasAccessToken: Boolean(trimValue(process.env.UPSTOX_ACCESS_TOKEN))
  };
};

const inferSector = (instrument) => {
  if (instrument.instrumentType === 'INDEX' || String(instrument.segment || '').endsWith('_INDEX')) {
    return 'Index';
  }

  return 'Equity';
};

const cacheInstrument = (instrument) => {
  if (!instrument?.instrumentKey) {
    return instrument;
  }

  instrumentCacheByKey.set(instrument.instrumentKey, instrument);

  if (instrument.symbol) {
    instrumentCacheBySymbol.set(
      getInstrumentCacheKey({ symbol: instrument.symbol, exchange: instrument.exchange }),
      instrument
    );
  }

  return instrument;
};

const getCachedInstrument = ({ instrumentKey, symbol, exchange }) => {
  if (instrumentKey && instrumentCacheByKey.has(instrumentKey)) {
    return instrumentCacheByKey.get(instrumentKey);
  }

  if (symbol && exchange) {
    const cached = instrumentCacheBySymbol.get(getInstrumentCacheKey({ symbol, exchange }));
    if (cached) {
      return cached;
    }
  }

  if (symbol) {
    const normalizedSymbol = normalizeSymbol(symbol);

    for (const cached of instrumentCacheBySymbol.values()) {
      if (normalizeSymbol(cached.symbol) === normalizedSymbol) {
        return cached;
      }
    }
  }

  return null;
};

const normalizeInstrument = (instrument) =>
  cacheInstrument({
    symbol: instrument.trading_symbol || instrument.short_name || instrument.name || '',
    name: instrument.short_name || instrument.name || instrument.trading_symbol || '',
    exchange: instrument.exchange || 'NSE',
    sector: inferSector(instrument),
    price: 0,
    change: 0,
    instrumentKey: instrument.instrument_key || '',
    instrumentType: instrument.instrument_type || '',
    segment: instrument.segment || '',
    isin: instrument.isin || '',
    lotSize: Number(instrument.lot_size || 1),
    source: 'upstox'
  });

const searchUpstoxInstruments = async (query, options = {}) => {
  const normalizedQuery = trimValue(query);

  if (!normalizedQuery || !isUpstoxReady()) {
    return [];
  }

  try {
    const data = await fetchUpstoxJson('/v2/instruments/search', {
      searchParams: {
        query: normalizedQuery,
        exchanges: options.exchanges || 'NSE,BSE',
        segments: options.segments || 'EQ,INDEX',
        page_number: options.pageNumber || 1,
        records: options.records || 12
      }
    });

    return Array.isArray(data?.data) ? data.data.map(normalizeInstrument) : [];
  } catch (error) {
    warnOnce(`upstox-search-${normalizedQuery}`, `Upstox search unavailable for "${normalizedQuery}": ${error.message}`);
    return [];
  }
};

const normalizeQuote = (quote) => {
  const lastPrice = Number(quote?.last_price || quote?.ltp || 0);
  const previousClose = Number(
  quote?.previous_close ??
  quote?.prev_close ??
  (quote?.net_change != null && lastPrice
    ? lastPrice - Number(quote?.net_change)
    : 0)
);
  const changeAbsolute = Number(quote?.net_change ?? lastPrice - previousClose);
  const changePercent = previousClose
    ? Number((((lastPrice - previousClose) / previousClose) * 100).toFixed(2))
    : 0;

  return {
    instrumentKey: quote?.instrument_token || quote?.instrument_key || '',
    symbol: quote?.symbol || '',
    lastPrice,
    previousClose,
    changeAbsolute,
    changePercent,
    open: Number(quote?.ohlc?.open || 0),
    high: Number(quote?.ohlc?.high || 0),
    low: Number(quote?.ohlc?.low || 0),
    volume: Number(quote?.volume || 0),
    averagePrice: Number(quote?.average_price || 0),
    lowerCircuitLimit: Number(quote?.lower_circuit_limit || 0),
    upperCircuitLimit: Number(quote?.upper_circuit_limit || 0),
    totalBuyQuantity: Number(quote?.total_buy_quantity || 0),
    totalSellQuantity: Number(quote?.total_sell_quantity || 0),
    timestamp: quote?.timestamp || null
  };
};

const getUpstoxQuotes = async (instrumentKeys) => {
  const uniqueKeys = [...new Set((instrumentKeys || []).filter(Boolean))];

  if (uniqueKeys.length === 0 || !isUpstoxReady()) {
    return new Map();
  }

  const now = Date.now();
  const quotesByKey = new Map();
  const missingKeys = [];

  for (const key of uniqueKeys) {
    const cached = quoteCache.get(key);

    if (cached && cached.expiresAt > now) {
      quotesByKey.set(key, cached.value);
    } else {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length === 0) {
    return quotesByKey;
  }

  try {
    const data = await fetchUpstoxJson('/v2/market-quote/quotes', {
      searchParams: {
        instrument_key: missingKeys.join(',')
      }
    });

    for (const rawQuote of Object.values(data?.data || {})) {
      const quote = normalizeQuote(rawQuote);

      if (!quote.instrumentKey) {
        continue;
      }

      quoteCache.set(quote.instrumentKey, {
        expiresAt: now + QUOTE_CACHE_TTL_MS,
        value: quote
      });
      quotesByKey.set(quote.instrumentKey, quote);
    }
  } catch (error) {
    warnOnce('upstox-quotes-failed', `Upstox quotes unavailable: ${error.message}`);
  }

  return quotesByKey;
};

const formatCandleLabel = (timestamp, rangeKey) => {
  const date = new Date(timestamp);

  if (rangeKey === '1D') {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  if (rangeKey === '6M') {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      year: '2-digit'
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short'
  }).format(date);
};

const buildSeriesFromCandles = (rawCandles, rangeKey) => {
  const candles = [...rawCandles]
    .map((item) => ({
      label: formatCandleLabel(item[0], rangeKey),
      time: item[0],
      open: Number(item[1] || 0),
      high: Number(item[2] || 0),
      low: Number(item[3] || 0),
      close: Number(item[4] || 0),
      volume: Number(item[5] || 0)
    }))
    .sort((left, right) => new Date(left.time).getTime() - new Date(right.time).getTime());

  if (candles.length === 0) {
    return null;
  }

  const low = Math.min(...candles.map((item) => item.low));
  const high = Math.max(...candles.map((item) => item.high));
  const start = candles[0]?.open || 0;
  const end = candles[candles.length - 1]?.close || 0;

  return {
    points: candles.map((item) => ({ label: item.label, price: item.close })),
    candles,
    change: start ? Number((((end - start) / start) * 100).toFixed(2)) : 0,
    high,
    low
  };
};

const fetchRangeCandles = async (instrumentKey, rangeKey) => {
  const config = rangeConfig[rangeKey];

  if (!config) {
    return null;
  }

  const encodedKey = encodeURIComponent(instrumentKey);

  if (config.kind === 'intraday') {
    const data = await fetchUpstoxJson(
      `/v3/historical-candle/intraday/${encodedKey}/${config.unit}/${config.interval}`
    );

    return buildSeriesFromCandles(data?.data?.candles || [], rangeKey);
  }

  const toDate = getDateOffset(0);
  const fromDate = getDateOffset(config.lookbackDays);
  const data = await fetchUpstoxJson(
    `/v3/historical-candle/${encodedKey}/${config.unit}/${config.interval}/${toDate}/${fromDate}`
  );

  return buildSeriesFromCandles(data?.data?.candles || [], rangeKey);
};

const getUpstoxSeriesForRange = async (instrumentKey, rangeKey) => {
  if (!instrumentKey || !isUpstoxReady()) {
    return null;
  }

  const cacheKey = `${instrumentKey}::${rangeKey}`;
  const cached = candleCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const series = await fetchRangeCandles(instrumentKey, rangeKey);

    if (!series) {
      return null;
    }

    candleCache.set(cacheKey, {
      expiresAt: Date.now() + CANDLE_CACHE_TTL_MS,
      value: series
    });

    return series;
  } catch (error) {
    warnOnce(`${cacheKey}-failed`, `Upstox candle data unavailable for ${instrumentKey} ${rangeKey}: ${error.message}`);
    return null;
  }
};

module.exports = {
  cacheInstrument,
  getCachedInstrument,
  getUpstoxQuotes,
  getUpstoxSeriesForRange,
  getUpstoxStatus,
  isUpstoxReady,
  searchUpstoxInstruments
};
