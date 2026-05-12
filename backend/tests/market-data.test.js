const test = require('node:test');
const assert = require('node:assert/strict');
const {
  enrichStocksWithLiveQuotes,
  getLiveQuoteForStock,
  mergeQuoteIntoStock
} = require('../services/marketData');

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
    change: 2.04,
    instrumentKey: '',
    source: 'upstox'
  });
});

test('enrichStocksWithLiveQuotes falls back to the seeded stock dataset when Upstox is unavailable', async () => {
  const stocks = [
    { symbol: 'INFY', price: 1510, change: 1.23 },
    { symbol: 'TCS', price: 3890, change: -0.48 }
  ];

  const enrichedStocks = await enrichStocksWithLiveQuotes(stocks);

  assert.equal(enrichedStocks.length, 2);
  assert.equal(enrichedStocks[0].symbol, 'INFY');
  assert.equal(enrichedStocks[0].price, 1510);
  assert.equal(enrichedStocks[0].change, 1.23);
  assert.equal(enrichedStocks[0].source, 'seeded');

  assert.equal(enrichedStocks[1].symbol, 'TCS');
  assert.equal(enrichedStocks[1].price, 3490.6);
  assert.equal(enrichedStocks[1].change, 0.84);
  assert.equal(enrichedStocks[1].source, 'seeded');
  assert.notEqual(enrichedStocks[0], stocks[0]);
  assert.notEqual(enrichedStocks[1], stocks[1]);
});

test('getLiveQuoteForStock returns null while seeded market data mode is active', async () => {
  const liveQuote = await getLiveQuoteForStock({ symbol: 'INFY', price: 1510, change: 1.23 });

  assert.equal(liveQuote, null);
});
