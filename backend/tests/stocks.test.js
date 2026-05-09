const test = require('node:test');
const assert = require('node:assert/strict');
const { STOCKS, getStockBySymbol, buildStockDetails } = require('../data/stocks');

test('getStockBySymbol matches stock symbols case-insensitively', () => {
  const stock = getStockBySymbol('reliance');

  assert.equal(stock.symbol, 'RELIANCE');
  assert.equal(stock.exchange, 'NSE');
});

test('getStockBySymbol returns undefined for unknown symbols', () => {
  assert.equal(getStockBySymbol('UNKNOWN-STOCK'), undefined);
});

test('buildStockDetails returns null for unknown symbols', () => {
  assert.equal(buildStockDetails('UNKNOWN-STOCK'), null);
});

test('buildStockDetails returns performance, stats, company profile, and financials', () => {
  const details = buildStockDetails('TCS');

  assert.equal(details.stock.symbol, 'TCS');
  assert.ok(details.performance['1D']);
  assert.ok(details.performance['1M']);
  assert.ok(details.performance['6M']);
  assert.ok(details.stats.week52High >= details.stats.week52Low);
  assert.ok(details.stats.upperCircuit > details.stats.lowerCircuit);
  assert.equal(details.company.companyName, 'Tata Consultancy Services');
  assert.ok(details.company.website.includes('tataconsultancyservices'));
  assert.ok(details.financials.marketCap > 0);
  assert.ok(details.financials.peRatio > 0);
});

test('stock dataset includes both indices and tradable equities', () => {
  const indices = STOCKS.filter((stock) => stock.sector === 'Index');
  const equities = STOCKS.filter((stock) => stock.sector !== 'Index');

  assert.ok(indices.length >= 4);
  assert.ok(equities.length >= 20);
});
