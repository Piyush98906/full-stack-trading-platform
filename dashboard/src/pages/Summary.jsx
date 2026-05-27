import { useEffect, useMemo, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import LoadingSpinner from '../components/LoadingSpinner';
import { useStockDetail } from '../context/StockDetailContext';
import api from '../utils/api';
import { formatINR } from '../utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function Summary() {
  const { openStockDetail } = useStockDetail();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const { data } = await api.get('/holdings');
        setHoldings(data.holdings);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  const chartPayload = useMemo(() => {
    const pnlRows = holdings.map((item) => ({
      name: item.name,
      pnl: Number(((item.price - item.avg) * item.qty).toFixed(2)),
      sector: item.sector,
      currentValue: item.price * item.qty,
      dayPercent: Number(String(item.day).replace('%', ''))
    }));

    const sectorMap = pnlRows.reduce((acc, item) => {
      acc[item.sector] = (acc[item.sector] || 0) + item.currentValue;
      return acc;
    }, {});

    const trendSeed = holdings.reduce((sum, item) => sum + item.price * item.qty, 0);
    const trendPoints = Array.from({ length: 30 }, (_, index) => {
      const drift = 1 + (Math.sin(index / 4) * 0.02 + index * 0.0015);
      return Number((trendSeed * drift).toFixed(2));
    });

    return {
      pnlRows,
      sectorMap,
      trendPoints
    };
  }, [holdings]);

  if (loading) {
    return <LoadingSpinner label="Loading summary charts..." />;
  }

  const gainers = [...chartPayload.pnlRows]
    .sort((a, b) => b.dayPercent - a.dayPercent)
    .slice(0, 3);

  const losers = [...chartPayload.pnlRows]
    .sort((a, b) => a.dayPercent - b.dayPercent)
    .slice(0, 3);

  return (
    <div className="page-stack">
      <section className="content-grid two-col">
        <article className="panel-card chart-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Portfolio Performance</span>
              <h3>P&amp;L per holding</h3>
            </div>
          </div>
          <div className="summary-chart-wrap summary-chart-wrap-compact">
            <Bar
              data={{
                labels: chartPayload.pnlRows.map((item) => item.name),
                datasets: [
                  {
                    data: chartPayload.pnlRows.map((item) => item.pnl),
                    backgroundColor: chartPayload.pnlRows.map((item) =>
                      item.pnl >= 0 ? '#16A34A' : '#DC2626'
                    ),
                    borderRadius: 8
                  }
                ]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(0,0,0,0.05)' } }
                }
              }}
            />
          </div>
        </article>

        <article className="panel-card chart-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Sector Allocation</span>
              <h3>Current value split</h3>
            </div>
          </div>
          <div className="summary-chart-wrap summary-chart-wrap-compact summary-chart-wrap-donut">
            <Doughnut
              data={{
                labels: Object.keys(chartPayload.sectorMap),
                datasets: [
                  {
                    data: Object.values(chartPayload.sectorMap),
                    backgroundColor: ['#4F46E5', '#0EA5E9', '#16A34A', '#F97316', '#E11D48', '#14B8A6'],
                    borderWidth: 0
                  }
                ]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                cutout: '68%'
              }}
            />
          </div>
        </article>
      </section>

      <section className="summary-bottom-grid">
        <article className="panel-card chart-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Trend</span>
              <h3>Portfolio value over 30 days</h3>
            </div>
            <strong>{formatINR(chartPayload.trendPoints[chartPayload.trendPoints.length - 1] || 0)}</strong>
          </div>

          <div className="summary-chart-wrap summary-chart-wrap-wide">
            <Line
              data={{
                labels: Array.from({ length: 30 }, (_, index) => `Day ${index + 1}`),
                datasets: [
                  {
                    data: chartPayload.trendPoints,
                    label: 'Portfolio Value',
                    fill: true,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.12)',
                    tension: 0.35
                  }
                ]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(0,0,0,0.05)' } }
                }
              }}
            />
          </div>
        </article>

        <div className="summary-side-stack">
          <article className="panel-card">
            <div className="panel-head">
              <div>
                <span className="section-label">Leaders</span>
                <h3>Top Gainers</h3>
              </div>
            </div>
            {gainers.map((item) => (
              <div className="mini-row" key={item.name}>
                <div>
                  <button className="stock-link-button" onClick={() => openStockDetail(item.name)} type="button">
                    {item.name}
                  </button>
                  <small>{item.sector}</small>
                </div>
                <span className="pill-badge badge-executed">{item.dayPercent.toFixed(2)}%</span>
              </div>
            ))}
          </article>

          <article className="panel-card">
            <div className="panel-head">
              <div>
                <span className="section-label">Pressure</span>
                <h3>Top Losers</h3>
              </div>
            </div>
            {losers.map((item) => (
              <div className="mini-row" key={item.name}>
                <div>
                  <button className="stock-link-button" onClick={() => openStockDetail(item.name)} type="button">
                    {item.name}
                  </button>
                  <small>{item.sector}</small>
                </div>
                <span className="pill-badge badge-cancelled">{item.dayPercent.toFixed(2)}%</span>
              </div>
            ))}
          </article>
        </div>
      </section>
    </div>
  );
}

export default Summary;
