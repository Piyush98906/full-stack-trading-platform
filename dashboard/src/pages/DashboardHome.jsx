import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/KPICard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useStockDetail } from '../context/StockDetailContext';
import api from '../utils/api';
import { formatCompact, formatINR } from '../utils/format';
import { formatDashboardDate } from '../utils/market';
import { useAuth } from '../context/AuthContext';

const quickFeatures = [
  { code: 'IPO', title: 'IPO Tracker', text: 'Upcoming issues, allotment windows, and simple offer notes.' },
  { code: 'ETF', title: 'ETF Basket', text: 'Placeholder shelf for index, gold, debt, and thematic ETFs.' },
  { code: 'SIP', title: 'Stock SIP', text: 'Recurring investing ideas for beginners building discipline.' },
  { code: 'BND', title: 'Bonds', text: 'Government and corporate bond discovery section placeholder.' },
  { code: 'EV', title: 'Events', text: 'Results, dividends, splits, and other market-moving calendars.' }
];

const getIstDateKey = (value) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value));

function DashboardHome() {
  const navigate = useNavigate();
  const { openStockDetail } = useStockDetail();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [funds, setFunds] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [marketOverview, setMarketOverview] = useState({
    topGainers: [],
    topLosers: [],
    topIntraday: [],
    indices: []
  });

  const fetchDashboardData = async (withSpinner = false) => {
    try {
      if (withSpinner) {
        setLoading(true);
      }

      const [holdingsResponse, positionsResponse, ordersResponse, fundsResponse, marketResponse] = await Promise.all([
        api.get('/holdings'),
        api.get('/positions'),
        api.get('/orders'),
        api.get('/funds'),
        api.get('/stocks/market-overview')
      ]);

      setHoldings(holdingsResponse.data.holdings);
      setPositions(positionsResponse.data.positions);
      setOrders(ordersResponse.data.orders);
      setFunds(fundsResponse.data);
      setMarketOverview(marketResponse.data);
    } finally {
      if (withSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData(true);

    const timer = window.setInterval(() => {
      fetchDashboardData(false);
    }, 15000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const metrics = useMemo(() => {
    const holdingsInvested = holdings.reduce((sum, item) => sum + item.avg * item.qty, 0);
    const holdingsCurrent = holdings.reduce((sum, item) => sum + item.price * item.qty, 0);
    const holdingsPnl = holdingsCurrent - holdingsInvested;
    const positionsCurrent = positions.reduce((sum, item) => sum + item.price * item.qty, 0);
    const positionsDayPnl = positions.reduce((sum, item) => {
      const dayPercent = Number(String(item.day).replace('%', ''));
      return sum + (item.price * item.qty * dayPercent) / 100;
    }, 0);
    const holdingsDayPnl = holdings.reduce((sum, item) => {
      const dayPercent = Number(String(item.day).replace('%', ''));
      return sum + (item.price * item.qty * dayPercent) / 100;
    }, 0);
    const todayKey = getIstDateKey(new Date());
    const realizedToday = orders.reduce((sum, order) => {
      if (order.status !== 'executed' || Number(order.realizedPnl || 0) === 0) {
        return sum;
      }

      return getIstDateKey(order.createdAt) === todayKey ? sum + Number(order.realizedPnl || 0) : sum;
    }, 0);

    return {
      portfolioValue: holdingsCurrent + positionsCurrent,
      pnl: holdingsPnl,
      dayPnl: holdingsDayPnl + positionsDayPnl + realizedToday,
      realizedToday
    };
  }, [holdings, positions, orders]);

  if (loading) {
    return <LoadingSpinner label="Loading your dashboard..." />;
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2 className="page-heading">Good morning, {user?.name}</h2>
          <p className="page-subtitle">{formatDashboardDate()}</p>
        </div>
      </section>

      <section className="kpi-grid">
        <KPICard
          title="Total Portfolio Value"
          value={formatCompact(metrics.portfolioValue)}
          change={formatINR(metrics.pnl)}
          icon="PV"
          tone="primary"
          onClick={() => navigate('/holdings')}
        />
        <KPICard
          title="Today's P&L"
          value={formatINR(metrics.dayPnl)}
          change={metrics.realizedToday ? `Realized ${formatINR(metrics.realizedToday)}` : 'Day movement'}
          changeTone={metrics.realizedToday ? (metrics.realizedToday >= 0 ? 'success' : 'danger') : 'muted'}
          icon="PL"
          tone={metrics.dayPnl >= 0 ? 'success' : 'danger'}
          onClick={() => navigate('/summary')}
        />
        <KPICard
          title="Total Holdings"
          value={String(holdings.length)}
          change={`${positions.length} positions`}
          changeTone="muted"
          icon="HD"
          tone="warning"
          onClick={() => navigate('/holdings')}
        />
        <KPICard
          title="Available Funds"
          value={formatCompact(funds?.available || 0)}
          change="Manage funds"
          changeTone="muted"
          icon="IN"
          tone="primary"
          onClick={() => navigate('/funds')}
        />
      </section>

      <section className="content-grid">
        <article className="panel-card wide-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Explore More</span>
              <h3>Upcoming modules</h3>
            </div>
          </div>

          <div className="feature-grid">
            {quickFeatures.map((feature) => (
              <button className="feature-tile feature-tile-button" key={feature.code} onClick={() => setSelectedFeature(feature)} type="button">
                <span className="feature-icon">{feature.code}</span>
                <strong>{feature.title}</strong>
                <p>{feature.text}</p>
              </button>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Market Indices</span>
              <h3>Track benchmark movement</h3>
            </div>
          </div>

          <div className="indices-widget">
            {marketOverview.indices.map((item) => (
              <button className="mini-row mini-row-button" key={item.symbol} onClick={() => openStockDetail(item)} type="button">
                <div>
                  <strong>{item.symbol}</strong>
                  <small>{item.exchange}</small>
                </div>
                <div className="text-right">
                  <strong>{item.price.toLocaleString('en-IN')}</strong>
                  <small className={item.change >= 0 ? 'text-success' : 'text-danger'}>
                    {item.change >= 0 ? '+' : ''}
                    {item.change.toFixed(2)}%
                  </small>
                </div>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="market-lists-grid">
        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Top Gainers</span>
              <h3>Strongest names today</h3>
            </div>
          </div>
          {marketOverview.topGainers.length ? marketOverview.topGainers.map((stock) => (
            <button className="mini-row mini-row-button" key={stock.symbol} onClick={() => openStockDetail(stock)} type="button">
              <div>
                <strong>{stock.symbol}</strong>
                <small>{stock.name}</small>
              </div>
              <div className="text-right">
                <strong>{formatINR(stock.price)}</strong>
                <small className="text-success">+{stock.change.toFixed(2)}%</small>
              </div>
            </button>
          )) : <EmptyState title="No market data found" description="Top gainers will show up here." />}
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Top Losers</span>
              <h3>Weakest names today</h3>
            </div>
          </div>
          {marketOverview.topLosers.length ? marketOverview.topLosers.map((stock) => (
            <button className="mini-row mini-row-button" key={stock.symbol} onClick={() => openStockDetail(stock)} type="button">
              <div>
                <strong>{stock.symbol}</strong>
                <small>{stock.name}</small>
              </div>
              <div className="text-right">
                <strong>{formatINR(stock.price)}</strong>
                <small className="text-danger">{stock.change.toFixed(2)}%</small>
              </div>
            </button>
          )) : <EmptyState title="No market data found" description="Top losers will show up here." />}
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Top Intraday</span>
              <h3>Most active opportunities</h3>
            </div>
          </div>
          {marketOverview.topIntraday.length ? marketOverview.topIntraday.map((stock) => (
            <button className="mini-row mini-row-button" key={stock.symbol} onClick={() => openStockDetail(stock)} type="button">
              <div>
                <strong>{stock.symbol}</strong>
                <small>{stock.name}</small>
              </div>
              <div className="text-right">
                <strong>{formatINR(stock.price)}</strong>
                <small className="text-muted">Volume {formatCompact(stock.volume || 0)}</small>
                <small className={stock.change >= 0 ? 'text-success' : 'text-danger'}>
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)}%
                </small>
              </div>
            </button>
          )) : <EmptyState title="No market data found" description="Intraday leaders will show up here." />}
        </article>
      </section>

      {selectedFeature ? (
        <div className="modal-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="feature-modal" onClick={(event) => event.stopPropagation()}>
            <span className="section-label">Future Module</span>
            <h3>{selectedFeature.title}</h3>
            <p className="page-subtitle">
              This module is planned for a future version of the platform. The card is active so you can
              showcase the roadmap without making it look like plain placeholder text.
            </p>
            <div className="feature-modal-chip-row">
              <span className="pill-badge badge-pending">Work in progress</span>
              <span className="pill-badge badge-executed">Planned roadmap item</span>
            </div>
            <button className="button button-primary" onClick={() => setSelectedFeature(null)} type="button">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DashboardHome;
