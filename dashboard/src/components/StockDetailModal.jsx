import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatCompact, formatINR } from '../utils/format';
import { useStockDetail } from '../context/StockDetailContext';
import BuyModal from './BuyModal';
import CandlestickChart from './CandlestickChart';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const ranges = ['1D', '1W', '1M', '6M'];

function StockDetailModal() {
  const { selectedStock, closeStockDetail } = useStockDetail();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [activeRange, setActiveRange] = useState('1D');
  const [availableFunds, setAvailableFunds] = useState(0);
  const [tradeMode, setTradeMode] = useState('');

  const fetchDetails = async (stock, withSpinner = true) => {
    if (!stock?.symbol) {
      return;
    }

    try {
      if (withSpinner) {
        setLoading(true);
      }
      setError('');
      const params = {};

      if (stock.instrumentKey) {
        params.instrumentKey = stock.instrumentKey;
      }

      if (stock.exchange) {
        params.exchange = stock.exchange;
      }

      if (stock.name) {
        params.name = stock.name;
      }

      if (stock.sector) {
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
      if (withSpinner) {
        setLoading(false);
      }
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

    fetchDetails(selectedStock, true);
  }, [selectedStock]);

  useEffect(() => {
    if (!selectedStock?.symbol) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      fetchDetails(selectedStock, false);
    }, 500);

    return () => {
      window.clearInterval(timer);
    };
  }, [selectedStock]);

  const activeSeries = details?.performance?.[activeRange] || details?.performance?.['1D'] || null;
  const candleSeries = activeSeries?.candles || [];
  const allowTrading = details?.stock?.sector !== 'Index';
  const stockChange = details?.stock?.change ?? (details?.stock?.price && details?.stats?.previousClose
    ? Number((((details.stock.price - details.stats.previousClose) / details.stats.previousClose) * 100).toFixed(2))
    : 0);

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
                {details?.stock ? <span className="text-muted">{` · ${details.stock.exchange}`}</span> : null}
              </h2>
              {details?.company ? <p className="stock-subtitle">{details.company.companyName}</p> : null}
            </div>
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
              <div className="stock-hero stock-hero-tight">
                <div>
                  <strong className="stock-live-price">{formatINR(details.stock.price)}</strong>
                  <p className={stockChange >= 0 ? 'text-success' : 'text-danger'}>
                    {stockChange >= 0 ? '+' : ''}
                    {stockChange.toFixed(2)}%
                  </p>
                </div>

                {allowTrading ? (
                  <div className="stock-cta-buttons stock-cta-spread">
                    <button className="button button-primary stock-cta-button" onClick={() => setTradeMode('buy')} type="button">
                      Buy
                    </button>
                    <button className="button button-danger stock-cta-button" onClick={() => setTradeMode('sell')} type="button">
                      Sell
                    </button>
                  </div>
                ) : (
                  <span className="pill-badge badge-pending">Index details only</span>
                )}
              </div>

              <div className="panel-card stock-chart-card stock-chart-card-full">
                <div className="stock-chart-head">
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
                </div>

                <div className="stock-chart-frame">
                  {candleSeries.length ? (
                    <CandlestickChart candles={candleSeries} sessionSlots={activeSeries?.sessionSlots} />
                  ) : (
                    <EmptyState
                      title="Chart unavailable"
                      description="This time range is not available for the selected stock right now."
                    />
                  )}
                </div>
              </div>

              <div className="stock-metrics-grid">
                <div className="stock-metric-tile">
                  <span>52W High</span>
                  <strong>{formatINR(details.stats.week52High)}</strong>
                </div>
                <div className="stock-metric-tile">
                  <span>52W Low</span>
                  <strong>{formatINR(details.stats.week52Low)}</strong>
                </div>
                <div className="stock-metric-tile">
                  <span>Prev Close</span>
                  <strong>{formatINR(details.stats.previousClose)}</strong>
                </div>
                <div className="stock-metric-tile">
                  <span>Today High</span>
                  <strong>{formatINR(details.stats.todayHigh)}</strong>
                </div>
                <div className="stock-metric-tile">
                  <span>Today Low</span>
                  <strong>{formatINR(details.stats.todayLow)}</strong>
                </div>
                <div className="stock-metric-tile">
                  <span>Lot Size</span>
                  <strong>{details.stats.lotSize}</strong>
                </div>
              </div>

              <div className="content-grid two-col stock-detail-grid">
                <article className="panel-card stock-story-card">
                  <div className="panel-head">
                    <div>
                      <span className="section-label">Company Overview</span>
                      <h3>{details.company.companyName}</h3>
                    </div>
                  </div>
                  <p className="stock-description">{details.company.description}</p>
                  <div className="stock-chip-row">
                    <span className="pill-badge badge-buy">{details.company.sector}</span>
                    <span className="pill-badge badge-executed">{details.company.headquarters}</span>
                    <span className="pill-badge badge-pending">Founded {details.company.founded}</span>
                  </div>
                  <div className="stock-overview-grid">
                    <div className="comparison-row">
                      <span>Employees</span>
                      <strong>{details.company.employees.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="comparison-row">
                      <span>Website</span>
                      <strong>{details.company.website.replace('https://', '')}</strong>
                    </div>
                    <div className="comparison-row">
                      <span>Upper Circuit</span>
                      <strong>{formatINR(details.stats.upperCircuit)}</strong>
                    </div>
                    <div className="comparison-row">
                      <span>Lower Circuit</span>
                      <strong>{formatINR(details.stats.lowerCircuit)}</strong>
                    </div>
                  </div>
                </article>

                <article className="panel-card stock-story-card">
                  <div className="panel-head">
                    <div>
                      <span className="section-label">Financial Snapshot</span>
                      <h3>Key fundamentals</h3>
                    </div>
                  </div>
                  <div className="stock-fundamentals-grid">
                    <div className="stock-fundamentals-card">
                      <span>Market Cap</span>
                      <strong>{formatCompact(details.financials.marketCap)}</strong>
                    </div>
                    <div className="stock-fundamentals-card">
                      <span>P/E Ratio</span>
                      <strong>{details.financials.peRatio}</strong>
                    </div>
                    <div className="stock-fundamentals-card">
                      <span>EPS</span>
                      <strong>{details.financials.eps}</strong>
                    </div>
                    <div className="stock-fundamentals-card">
                      <span>Book Value</span>
                      <strong>{formatINR(details.financials.bookValue)}</strong>
                    </div>
                    <div className="stock-fundamentals-card">
                      <span>Dividend Yield</span>
                      <strong>{details.financials.dividendYield}%</strong>
                    </div>
                    <div className="stock-fundamentals-card">
                      <span>Debt / Equity</span>
                      <strong>{details.financials.debtToEquity}</strong>
                    </div>
                    <div className="stock-fundamentals-card">
                      <span>ROE</span>
                      <strong>{details.financials.roe}%</strong>
                    </div>
                    <div className="stock-fundamentals-card">
                      <span>ROCE</span>
                      <strong>{details.financials.roce}%</strong>
                    </div>
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
        onSuccess={() => fetchDetails(details?.stock || selectedStock, false)}
        availableFunds={availableFunds}
      />
    </>
  );
}

export default StockDetailModal;
