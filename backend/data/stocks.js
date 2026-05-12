const STOCKS = [
  { symbol: 'NIFTY50', name: 'NIFTY 50', sector: 'Index', exchange: 'NSE', price: 22475.4, change: 0.68 },
  { symbol: 'SENSEX', name: 'S&P BSE SENSEX', sector: 'Index', exchange: 'BSE', price: 73985.12, change: 0.57 },
  { symbol: 'NIFTYBANK', name: 'NIFTY BANK', sector: 'Index', exchange: 'NSE', price: 48210.8, change: 0.74 },
  { symbol: 'NIFTYIT', name: 'NIFTY IT', sector: 'Index', exchange: 'NSE', price: 36992.25, change: 1.1 },
  { symbol: 'NIFTYMIDCAP', name: 'NIFTY MIDCAP', sector: 'Index', exchange: 'NSE', price: 12152.34, change: 0.44 },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy', exchange: 'NSE', price: 2962.8, change: 1.09 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', exchange: 'NSE', price: 3490.6, change: 0.84 },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', exchange: 'NSE', price: 1510.0, change: 1.23 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', exchange: 'NSE', price: 1590.0, change: -0.55 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', exchange: 'NSE', price: 1024.0, change: 1.44 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking', exchange: 'NSE', price: 1821.4, change: 0.26 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking', exchange: 'NSE', price: 1168.25, change: 0.49 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', exchange: 'NSE', price: 624.0, change: 1.62 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Finance', exchange: 'NSE', price: 7210.0, change: 0.98 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Finance', exchange: 'NSE', price: 1665.75, change: 0.71 },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', sector: 'Insurance', exchange: 'NSE', price: 634.1, change: -0.14 },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance', sector: 'Insurance', exchange: 'NSE', price: 1492.45, change: 0.19 },
  { symbol: 'ICICIPRU', name: 'ICICI Prudential Life Insurance', sector: 'Insurance', exchange: 'NSE', price: 610.8, change: 0.31 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Auto', exchange: 'NSE', price: 10848.0, change: 0.47 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Auto', exchange: 'NSE', price: 1012.15, change: 1.76 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Auto', exchange: 'NSE', price: 2356.7, change: 0.88 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Auto', exchange: 'NSE', price: 4625.15, change: -0.32 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', sector: 'Auto', exchange: 'NSE', price: 9320.0, change: 0.65 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Metals', exchange: 'NSE', price: 164.2, change: 1.08 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', sector: 'Metals', exchange: 'NSE', price: 631.15, change: 0.53 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Metals', exchange: 'NSE', price: 906.4, change: 0.46 },
  { symbol: 'VEDL', name: 'Vedanta Ltd', sector: 'Metals', exchange: 'NSE', price: 381.5, change: -0.6 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Energy', exchange: 'NSE', price: 476.4, change: 0.37 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', exchange: 'NSE', price: 430.0, change: -0.22 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT', exchange: 'NSE', price: 1198.0, change: 0.63 },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT', exchange: 'NSE', price: 1311.35, change: 0.57 },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'IT', exchange: 'NSE', price: 5010.0, change: -1.02 },
  { symbol: 'MPHASIS', name: 'Mphasis Ltd', sector: 'IT', exchange: 'NSE', price: 2488.1, change: 0.62 },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd', sector: 'IT', exchange: 'NSE', price: 3899.5, change: 1.14 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', sector: 'Pharma', exchange: 'NSE', price: 1618.25, change: 0.72 },
  { symbol: 'DRREDDY', name: 'Dr Reddy Laboratories', sector: 'Pharma', exchange: 'NSE', price: 6294.8, change: -0.18 },
  { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma', exchange: 'NSE', price: 1476.45, change: 0.52 },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd', sector: 'Pharma', exchange: 'NSE', price: 3888.2, change: 0.35 },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', sector: 'Healthcare', exchange: 'NSE', price: 6350.4, change: 0.41 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'Consumer', exchange: 'NSE', price: 2448.9, change: 0.18 },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'Consumer', exchange: 'NSE', price: 438.35, change: 0.21 },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'Consumer', exchange: 'NSE', price: 2525.3, change: -0.11 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'Consumer', exchange: 'NSE', price: 5206.1, change: 0.43 },
  { symbol: 'DABUR', name: 'Dabur India Ltd', sector: 'Consumer', exchange: 'NSE', price: 571.9, change: 0.28 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation', sector: 'Utilities', exchange: 'NSE', price: 315.65, change: 0.34 },
  { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Utilities', exchange: 'NSE', price: 372.4, change: 0.67 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ', sector: 'Logistics', exchange: 'NSE', price: 1398.7, change: 0.95 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Conglomerate', exchange: 'NSE', price: 3205.45, change: 1.21 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement', exchange: 'NSE', price: 10185.0, change: 0.39 },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer', exchange: 'NSE', price: 3285.0, change: 0.72 },
  { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail', exchange: 'NSE', price: 4210.45, change: 1.42 },
  { symbol: 'DMART', name: 'Avenue Supermarts Ltd', sector: 'Retail', exchange: 'NSE', price: 4386.25, change: -0.24 },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures', sector: 'Retail', exchange: 'NSE', price: 189.6, change: 0.77 },
  { symbol: 'ZOMATO', name: 'Zomato Ltd', sector: 'Internet', exchange: 'NSE', price: 202.55, change: 1.53 },
  { symbol: 'PAYTM', name: 'One 97 Communications Ltd', sector: 'Fintech', exchange: 'NSE', price: 432.3, change: -0.88 },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation', sector: 'Energy', exchange: 'NSE', price: 281.15, change: 0.62 },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation', sector: 'Energy', exchange: 'NSE', price: 614.8, change: 0.52 }
];

const sectorNarratives = {
  Index: 'A benchmark market basket used to track broader sentiment and capital rotation across Indian equities.',
  Energy: 'A core large-cap business with meaningful influence from crude trends, domestic demand, and capital expenditure cycles.',
  IT: 'A technology-led exporter with strong digital services exposure, global delivery scale, and margin sensitivity to demand cycles.',
  Banking: 'A diversified financial institution with retail and corporate lending exposure, deposit franchise strength, and credit cycle sensitivity.',
  Finance: 'A non-bank financial business with consumer and commercial lending exposure, influenced by credit growth and borrowing costs.',
  Insurance: 'A long-duration financial franchise focused on protection, savings, and distribution-led premium growth.',
  Auto: 'A vehicle manufacturer tied to consumer demand, input costs, festive season trends, and channel inventory movement.',
  Metals: 'A cyclical materials business influenced by commodity pricing, capacity utilization, and global demand conditions.',
  Pharma: 'A defensive healthcare company driven by domestic formulations, export pipelines, and regulatory execution.',
  Healthcare: 'A hospital and care platform influenced by occupancy, treatment mix, and network expansion.',
  Consumer: 'A branded consumption business with recurring demand, distribution depth, and pricing-power characteristics.',
  Utilities: 'A stable cash-flow business tied to regulated returns, infrastructure demand, and energy transition spending.',
  Logistics: 'A trade and freight platform with revenue linked to port throughput, infrastructure utilization, and cargo mix.',
  Conglomerate: 'A diversified operator with multiple business lines and capital allocation-led performance drivers.',
  Cement: 'An infrastructure-linked materials business sensitive to utilization, real estate activity, and energy costs.',
  Retail: 'A consumer-facing growth company shaped by category expansion, store productivity, and discretionary demand.',
  Internet: 'A digital platform business with focus on user growth, monetization, and operating leverage.',
  Fintech: 'A payments and financial services platform balancing transaction growth, merchant adoption, and monetization expansion.'
};

const sectorHeadquarters = {
  Index: 'Mumbai, India',
  Energy: 'Mumbai, India',
  IT: 'Bengaluru, India',
  Banking: 'Mumbai, India',
  Finance: 'Pune, India',
  Insurance: 'Mumbai, India',
  Auto: 'Gurugram, India',
  Metals: 'Mumbai, India',
  Pharma: 'Hyderabad, India',
  Healthcare: 'Chennai, India',
  Consumer: 'Mumbai, India',
  Utilities: 'New Delhi, India',
  Logistics: 'Ahmedabad, India',
  Conglomerate: 'Ahmedabad, India',
  Cement: 'Mumbai, India',
  Retail: 'Mumbai, India',
  Internet: 'Gurugram, India',
  Fintech: 'Noida, India'
};

const rangeDefinitions = {
  '1D': { points: 7, amplitude: 0.009, labels: ['09:15', '09:25', '09:35', '09:45', '09:55', '10:05', '10:15'] },
  '1W': { points: 5, amplitude: 0.028, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  '1M': { points: 6, amplitude: 0.052, labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'Now'] },
  '6M': { points: 6, amplitude: 0.135, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Now'] }
};

const makeSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

const getStockBySymbol = (symbol) =>
  STOCKS.find((stock) => stock.symbol.toLowerCase() === String(symbol).toLowerCase());

const getSeedNumber = (stock) =>
  stock.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

const createSeries = (stock, definition, key) => {
  const seed = getSeedNumber(stock);
  const candles = [];
  const baseDate = new Date(2026, 0, 1, 9, 15);

  for (let index = 0; index < definition.labels.length; index += 1) {
    const label = definition.labels[index];
    const drift = ((index + 1) / definition.points) * (stock.change / 100);
    const base = stock.price * (1 - definition.amplitude / 2 + drift);
    const close = Number((base + Math.sin((seed + index * 17) / 11) * stock.price * definition.amplitude).toFixed(2));
    const open = Number((index === 0 ? stock.price : candles[index - 1].close).toFixed(2));
    const high = Number((Math.max(open, close) * (1 + Math.abs(Math.cos((seed + index * 5) / 9)) * 0.007)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.abs(Math.sin((seed + index * 3) / 7)) * 0.007)).toFixed(2));

    const time = new Date(baseDate);
    if (key === '1D') {
      time.setMinutes(baseDate.getMinutes() + index * 60);
    } else {
      time.setDate(baseDate.getDate() + index);
    }

    candles.push({ label, time, open, high, low, close });
  }

  const low = Math.min(...candles.map((item) => item.low));
  const high = Math.max(...candles.map((item) => item.high));
  const start = candles[0]?.open || stock.price;
  const end = candles[candles.length - 1]?.close || stock.price;

  return {
    points: candles.map((item) => ({ label: item.label, price: item.close })),
    candles,
    change: Number((((end - start) / start) * 100).toFixed(2)),
    high,
    low
  };
};

const buildPerformance = (stock) =>
  Object.entries(rangeDefinitions).reduce((acc, [key, definition]) => {
    acc[key] = createSeries(stock, definition, key);
    return acc;
  }, {});

const buildFinancials = (stock) => {
  const seed = getSeedNumber(stock);
  const marketCap = Number((stock.price * (seed + 90000) * 125).toFixed(2));
  const peRatio = Number((18 + (seed % 13) + stock.change).toFixed(2));
  const eps = Number((stock.price / Math.max(peRatio, 1)).toFixed(2));
  const bookValue = Number((stock.price * (0.58 + (seed % 9) / 20)).toFixed(2));
  const dividendYield = Number((0.3 + (seed % 6) * 0.28).toFixed(2));
  const roe = Number((10 + (seed % 12) * 1.15).toFixed(2));
  const roce = Number((11 + (seed % 10) * 1.22).toFixed(2));
  const debtToEquity = Number((0.08 + (seed % 8) * 0.17).toFixed(2));

  return {
    marketCap,
    peRatio,
    eps,
    bookValue,
    dividendYield,
    roe,
    roce,
    debtToEquity
  };
};

const buildCompanyProfile = (stock) => {
  const seed = getSeedNumber(stock);
  const founded = 1970 + (seed % 38);
  const employees = 1800 + (seed % 350) * 120;

  return {
    symbol: stock.symbol,
    companyName: stock.name,
    sector: stock.sector,
    exchange: stock.exchange,
    headquarters: sectorHeadquarters[stock.sector] || 'Mumbai, India',
    founded,
    employees,
    website: `https://www.${makeSlug(stock.name)}.com`,
    description:
      sectorNarratives[stock.sector] ||
      'A listed Indian company with sector-driven earnings, institutional coverage, and active market participation.'
  };
};

const buildStockDetailsFromStock = (stock) => {
  const performance = buildPerformance(stock);
  const yearTrack = performance['6M'].points.concat(
    performance['1M'].points.map((point, index) => ({
      label: `Ext ${index + 1}`,
      price: Number((point.price * (0.96 + index * 0.008)).toFixed(2))
    }))
  );
  const week52High = Number((Math.max(...yearTrack.map((point) => point.price)) * 1.04).toFixed(2));
  const week52Low = Number((Math.min(...yearTrack.map((point) => point.price)) * 0.96).toFixed(2));

  const daySeries = performance['1D'];
  return {
    stock,
    performance,
    stats: {
      week52High,
      week52Low,
      todayHigh: daySeries?.high || stock.price,
      todayLow: daySeries?.low || stock.price,
      upperCircuit: Number((stock.price * 1.1).toFixed(2)),
      lowerCircuit: Number((stock.price * 0.9).toFixed(2)),
      lotSize: stock.sector === 'Index' ? 1 : 1 + (getSeedNumber(stock) % 5),
      previousClose: Number((stock.price / (1 + stock.change / 100)).toFixed(2))
    },
    company: buildCompanyProfile(stock),
    financials: buildFinancials(stock)
  };
};

const buildStockDetails = (symbol) => {
  const stock = getStockBySymbol(symbol);

  if (!stock) {
    return null;
  }

  return buildStockDetailsFromStock(stock);
};

module.exports = { STOCKS, getStockBySymbol, buildStockDetails, buildStockDetailsFromStock };
