const test = require('node:test');
const assert = require('node:assert/strict');
const { getProviderSymbol, mergeQuoteIntoStock, toQuote } = require('../services/marketData');

test('getProviderSymbol appends NSE suffix by default', () => {
  assert.equal(getProviderSymbol({ symbol: 'RELIANCE', exchange: 'NSE' }), 'RELIANCE.NS');
});

test('getProviderSymbol appends BSE suffix for BSE symbols', () => {
  assert.equal(getProviderSymbol({ symbol: 'SENSEX', exchange: 'BSE' }), 'SENSEX.BO');
});

test('getProviderSymbol preserves explicit provider suffixes', () => {
  assert.equal(getProviderSymbol('ITC.NS'), 'ITC.NS');
  assert.equal(getProviderSymbol('ITC.BO'), 'ITC.BO');
});

test('mergeQuoteIntoStock keeps original stock when no live quote exists', () => {
  const stock = { symbol: 'INFY', price: 1510, change: 1.23 };

  assert.deepEqual(mergeQuoteIntoStock(stock, null), stock);
});

test('mergeQuoteIntoStock overlays live price and percent change', () => {
  const stock = { symbol: 'INFY', price: 1510, change: 1.23 };
  const quote = { lastPrice: 1526.5, changePercent: 2.04 };

  assert.deepEqual(mergeQuoteIntoStock(stock, quote), {
    symbol: 'INFY',
    price: 1526.5,
    change: 2.04
  });
});

test('toQuote normalizes provider response into internal quote shape', () => {
  const quote = toQuote({
    change: 10.2,
    day_high: 1520.4,
    day_low: 1490.1,
    last_price: 1512.35,
    market_cap: 6100000000,
    open: 1501.2,
    pe_ratio: 22.4,
    percent_change: 0.68,
    previous_close: 1502.15,
    sector: 'IT',
    symbol: 'INFY',
    volume: 8200000,
    year_high: 1900,
    year_low: 1300
  });

  assert.deepEqual(quote, {
    changeAbsolute: 10.2,
    changePercent: 0.68,
    high: 1520.4,
    lastPrice: 1512.35,
    low: 1490.1,
    marketCap: 6100000000,
    open: 1501.2,
    peRatio: 22.4,
    previousClose: 1502.15,
    sector: 'IT',
    symbol: 'INFY',
    volume: 8200000,
    week52High: 1900,
    week52Low: 1300
  });
});
