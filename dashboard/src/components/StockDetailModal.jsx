import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import api from '../utils/api';
import { formatCompact, formatINR } from '../utils/format';
import { useStockDetail } from '../context/StockDetailContext';
import BuyModal from './BuyModal';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const ranges = ['1D', '3D', '5D', '1W', '1M', '6M'];

function StockDetailModal() {
  const { selectedStock, closeStockDetail } = useStockDetail();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [activeRange, setActiveRange] = useState('1D');
  const [availableFunds, setAvailableFunds] = useState(0);
  const [tradeMode, setTradeMode] = useState('');

  const fetchDetails = async (stock) => {
    try {
      setLoading(true);
      setError('');
      const params = {};

      if (stock?.instrumentKey) {
        params.instrumentKey = stock.instrumentKey;
      }

      if (stock?.exchange) {
        params.exchange = stock.exchange;
      }

      if (stock?.name) {
        params.name = stock.name;
      }

      if (stock?.sector) {
        params.sector = stock.sector;
      }

      const [detailsResponse, fundsResponse] = await Promise.all([
        api.get(`/stocks/details/${encodeURIComponent(stock.symbol)}`, { params }),
        api.get('/funds')
      ]);
      setDetails(detailsResponse.data);
      setAvailableFunds(fundsResponse.data.available);
    } catch (requestError) {
      setDetails(null);
      setError(requestError.response?.data?.message || 'Unable to load this stock right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedStock?.symbol) {
      setDetails(null);
      setError('');
      setActiveRange('1D');
      setTradeMode('');
      return;
    }

    fetchDetails(selectedStock);
  }, [selectedStock]);

  const activeSeries = details?.performance?.[activeRange];
  const candleSeries = activeSeries?.candles || [];
  const allowTrading = details?.stock?.sector !== 'Index';

  const stockChange = details?.stock?.change ?? (details?.stock?.price && details?.stats?.previousClose
    ? Number((((details.stock.price - details.stats.previousClose) / details.stats.previousClose) * 100).toFixed(2))
    : 0);
  const activeChange = activeSeries?.change ?? 0;

  const chartData = useMemo(() => {
    if (!candleSeries.length || !details) {
      return null;
    }

    const closePrice = candleSeries.map((candle) => candle.close);
    const highPrice = candleSeries.map((candle) => candle.high);
    const lowPrice = candleSeries.map((candle) => candle.low);

    return {
      labels: candleSeries.map((candle) => candle.label),
      datasets: [
        {
          label: `${details.stock.symbol} close`,
          data: closePrice,
          borderColor: activeChange >= 0 ? '#16A34A' : '#DC2626',
          backgroundColor: activeChange >= 0 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 4,
          yAxisID: 'y'
        },
        {
          label: `${details.stock.symbol} high`,
          data: highPrice,
          borderColor: '#0EA5E9',
          borderWidth: 1,
          borderDash: [5, 5],
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          label: `${details.stock.symbol} low`,
          data: lowPrice,
          borderColor: '#F97316',
          borderWidth: 1,
          borderDash: [5, 5],
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: 'y'
        }
      ]
    };
  }, [candleSeries, details, activeChange]);

  if (!selectedStock?.symbol) {
    return null;
  }

  return (
    <>
      <div className="modal-overlay" onClick={closeStockDetail}>
        <div className="stock-detail-modal" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header">
            <div>
              <span className="section-label">Stock Snapshot</span>
              <h2>
                {selectedStock.symbol}
                {details?.stock ? <span className="text-muted"> · {details.stock.exchange}</span> : null}
              </h2>
              {details?.company ? <p className="stock-subtitle">{details.company.companyName}</p> : null}
            </div>
            <button className="icon-button" onClick={closeStockDetail} type="button">
              X
            </button>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading stock details..." />
          ) : error || !details ? (
            <EmptyState
              title="Unable to load stock details"
              description={error || 'This stock detail panel could not be loaded right now.'}
            />
          ) : (
            <div className="stock-detail-body">
              <div className="stock-hero">
                <div>
                  <strong className="stock-live-price">{formatINR(details.stock.price)}</strong>
                  <p className={stockChange >= 0 ? 'text-success' : 'text-danger'}>
                    {stockChange >= 0 ? '+' : ''}
                    {stockChange.toFixed(2)}% today
                  </p>
                </div>
                <div className="stock-stat-strip">
                  <div className="stock-stat-card">
                    <span>52W High</span>
                    <strong>{formatINR(details.stats.week52High)}</strong>
                  </div>
                  <div className="stock-stat-card">
                    <span>52W Low</span>
                    <strong>{formatINR(details.stats.week52Low)}</strong>
                  </div>
                  <div className="stock-stat-card">
                    <span>Prev Close</span>
                    <strong>{formatINR(details.stats.previousClose)}</strong>
                  </div>
                  <div className="stock-stat-card">
                    <span>Today High</span>
                    <strong>{formatINR(details.stats.todayHigh)}</strong>
                  </div>
                  <div className="stock-stat-card">
                    <span>Today Low</span>
                    <strong>{formatINR(details.stats.todayLow)}</strong>
                  </div>
                  <div className="stock-stat-card">
                    <span>Lot Size</span>
                    <strong>{details.stats.lotSize}</strong>
                  </div>
                </div>
              </div>

              <div className="stock-action-row">
                <div className="tab-row">
                  {ranges.map((range) => (
                    <button
                      key={range}
                      type="button"
                      className={`tab-pill ${activeRange === range ? 'active' : ''}`}
                      onClick={() => setActiveRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                {allowTrading ? (
                  <div className="stock-cta-buttons">
                    <button className="button button-primary" onClick={() => setTradeMode('buy')} type="button">
                      Buy
                    </button>
                    <button className="button button-danger" onClick={() => setTradeMode('sell')} type="button">
                      Sell
                    </button>
                  </div>
                ) : (
                  <span className="pill-badge badge-pending">Index details only</span>
                )}
              </div>

              {chartData ? (
                <div className="panel-card stock-chart-card">
                  <div className="stock-chart-head">
                    <div>
                      <span className="section-label">Previous Performance</span>
                      <h3>{activeRange} trend</h3>
                    </div>
                    <span className={activeChange >= 0 ? 'pill-badge badge-executed' : 'pill-badge badge-cancelled'}>
                      {activeChange >= 0 ? '+' : ''}
                      {activeChange.toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ flex: 1, position: 'relative', minHeight: '320px' }}>
                    <Line
                      key={`${selectedStock.symbol}-${activeRange}`}
                      data={chartData}
                      redraw
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: true, position: 'top' },
                          tooltip: { mode: 'index', intersect: false }
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8' }
                          },
                          y: {
                            grid: { color: 'rgba(255,255,255,0.08)' },
                            ticks: { color: '#94a3b8' }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="content-grid two-col stock-detail-grid">
                <article className="panel-card">
                  <div className="panel-head">
                    <div>
                      <span className="section-label">Company Details</span>
                      <h3>Business overview</h3>
                    </div>
                  </div>
                  <p className="stock-description">{details.company.description}</p>
                  <div className="comparison-row">
                    <span>Sector</span>
                    <strong>{details.company.sector}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>Headquarters</span>
                    <strong>{details.company.headquarters}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>Founded</span>
                    <strong>{details.company.founded}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>Employees</span>
                    <strong>{details.company.employees.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>Website</span>
                    <strong>{details.company.website.replace('https://', '')}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>Upper / Lower Circuit</span>
                    <strong>
                      {formatINR(details.stats.upperCircuit)} / {formatINR(details.stats.lowerCircuit)}
                    </strong>
                  </div>
                </article>

                <article className="panel-card">
                  <div className="panel-head">
                    <div>
                      <span className="section-label">Financials</span>
                      <h3>Key metrics</h3>
                    </div>
                  </div>
                  <div className="comparison-row">
                    <span>Market Cap</span>
                    <strong>{formatCompact(details.financials.marketCap)}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>P/E Ratio</span>
                    <strong>{details.financials.peRatio}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>EPS</span>
                    <strong>{details.financials.eps}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>Book Value</span>
                    <strong>{formatINR(details.financials.bookValue)}</strong>
                  </div>
                  <div className="comparison-row">
                    <span>Dividend Yield</span>
                    <strong>{details.financials.dividendYield}%</strong>
                  </div>
                  <div className="comparison-row">
                    <span>ROE / ROCE</span>
                    <strong>
                      {details.financials.roe}% / {details.financials.roce}%
                    </strong>
                  </div>
                  <div className="comparison-row">
                    <span>Debt to Equity</span>
                    <strong>{details.financials.debtToEquity}</strong>
                  </div>
                </article>
              </div>
            </div>
          )}
        </div>
      </div>

      <BuyModal
        open={Boolean(tradeMode && details?.stock)}
        stock={details?.stock}
        mode={tradeMode || 'buy'}
        onClose={() => setTradeMode('')}
        onSuccess={() => fetchDetails(details?.stock || selectedStock)}
        availableFunds={availableFunds}
      />
    </>
  );
}

export default StockDetailModal;
