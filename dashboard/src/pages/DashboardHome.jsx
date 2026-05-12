import { useEffect, useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/KPICard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useStockDetail } from '../context/StockDetailContext';
import api from '../utils/api';
import { formatCompact, formatINR } from '../utils/format';
import { formatDashboardDate } from '../utils/market';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function DashboardHome() {
  const navigate = useNavigate();
  const { openStockDetail } = useStockDetail();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState([]);
  const [funds, setFunds] = useState(null);
  const [marketOverview, setMarketOverview] = useState({
    topGainers: [],
    topLosers: [],
    topIntraday: [],
    indices: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [holdingsResponse, fundsResponse, marketResponse] = await Promise.all([
          api.get('/holdings'),
          api.get('/funds'),
          api.get('/stocks/market-overview')
        ]);
        setHoldings(holdingsResponse.data.holdings);
        setFunds(fundsResponse.data);
        setMarketOverview(marketResponse.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const invested = holdings.reduce((sum, item) => sum + item.avg * item.qty, 0);
    const current = holdings.reduce((sum, item) => sum + item.price * item.qty, 0);
    const pnl = current - invested;
    const dayPnl = holdings.reduce((sum, item) => {
      const dayPercent = Number(String(item.day).replace('%', ''));
      return sum + (item.price * item.qty * dayPercent) / 100;
    }, 0);

    return {
      invested,
      current,
      pnl,
      dayPnl
    };
  }, [holdings]);

  const chartData = useMemo(() => {
    const combined = [...marketOverview.topGainers.slice(0, 4), ...marketOverview.topLosers.slice(0, 4)];

    return {
      labels: combined.map((item) => item.symbol),
      datasets: [
        {
          label: 'Day Change (%)',
          data: combined.map((item) => item.change),
          backgroundColor: combined.map((item) => (item.change >= 0 ? '#16A34A' : '#DC2626')),
          borderRadius: 8
        }
      ]
    };
  }, [marketOverview]);

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
          value={formatCompact(metrics.current)}
          change={formatINR(metrics.pnl)}
          icon="PV"
          tone="primary"
          onClick={() => navigate('/holdings')}
        />
        <KPICard
          title="Today's P&L"
          value={formatINR(metrics.dayPnl)}
          change={metrics.dayPnl >= 0 ? '+In profit' : '-In loss'}
          icon="PL"
          tone={metrics.dayPnl >= 0 ? 'success' : 'danger'}
          onClick={() => navigate('/summary')}
        />
        <KPICard
          title="Total Holdings"
          value={String(holdings.length)}
          change="View your portfolio"
          icon="HD"
          tone="warning"
          onClick={() => navigate('/holdings')}
        />
        <KPICard
          title="Available Funds"
          value={formatCompact(funds?.available || 0)}
          change="Manage funds"
          icon="IN"
          tone="primary"
          onClick={() => navigate('/funds')}
        />
      </section>

      <section className="content-grid">
        <article className="panel-card chart-panel wide-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Market Action</span>
              <h3>Top movers of the day</h3>
            </div>
          </div>

          {marketOverview.topGainers.length || marketOverview.topLosers.length ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(0,0,0,0.05)' } }
                }
              }}
            />
          ) : (
            <EmptyState title="No market data found" description="Market movers will show up here." />
          )}
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
          {marketOverview.topGainers.map((stock) => (
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
          ))}
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Top Losers</span>
              <h3>Weakest names today</h3>
            </div>
          </div>
          {marketOverview.topLosers.map((stock) => (
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
          ))}
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Top Intraday</span>
              <h3>Most active opportunities</h3>
            </div>
          </div>
          {marketOverview.topIntraday.map((stock) => (
            <button className="mini-row mini-row-button" key={stock.symbol} onClick={() => openStockDetail(stock)} type="button">
              <div>
                <strong>{stock.symbol}</strong>
                <small>{stock.name}</small>
              </div>
              <div className="text-right">
                <strong>{formatINR(stock.price)}</strong>
                <small className="text-muted">Turnover {formatCompact(stock.turnover)}</small>
                <small className={stock.change >= 0 ? 'text-success' : 'text-danger'}>
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)}%
                </small>
              </div>
            </button>
          ))}
        </article>
      </section>
    </div>
  );
}

export default DashboardHome;
