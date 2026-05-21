import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useStockDetail } from '../context/StockDetailContext';
import api from '../utils/api';
import { formatINR } from '../utils/format';

function Holdings() {
  const { openStockDetail } = useStockDetail();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const fetchHoldings = async (withSpinner = false) => {
    try {
      if (withSpinner) {
        setLoading(true);
      }

      const { data } = await api.get('/holdings');
      setHoldings(data.holdings);
    } finally {
      if (withSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchHoldings(true);

    const timer = window.setInterval(() => {
      fetchHoldings(false);
    }, 500);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const sortedHoldings = useMemo(() => {
    const rows = [...holdings];
    rows.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      return sortConfig.direction === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return rows;
  }, [holdings, sortConfig]);

  const summary = useMemo(() => {
    const invested = holdings.reduce((sum, item) => sum + item.avg * item.qty, 0);
    const current = holdings.reduce((sum, item) => sum + item.price * item.qty, 0);
    const pnl = current - invested;
    const dayPnl = holdings.reduce((sum, item) => {
      const dayPercent = Number(String(item.day).replace('%', ''));
      return sum + (item.price * item.qty * dayPercent) / 100;
    }, 0);

    return { invested, current, pnl, dayPnl };
  }, [holdings]);

  const toggleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportCsv = () => {
    const headers = ['Name', 'Exchange', 'Qty', 'Avg Price', 'LTP', 'Current Value', 'PnL', 'PnL %', 'Day Change'];
    const rows = holdings.map((item) => {
      const pnl = (item.price - item.avg) * item.qty;
      const pnlPercent = ((item.price - item.avg) / item.avg) * 100;

      return [
        item.name,
        item.exchange,
        item.qty,
        item.avg,
        item.price,
        (item.price * item.qty).toFixed(2),
        pnl.toFixed(2),
        pnlPercent.toFixed(2),
        item.day
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'holdings.csv';
    link.click();
  };

  if (loading) {
    return <LoadingSpinner label="Loading holdings..." />;
  }

  return (
    <div className="page-stack">
      <section className="summary-grid four">
        <div className="stat-card">
          <span>Total Invested</span>
          <strong>{formatINR(summary.invested)}</strong>
        </div>
        <div className="stat-card">
          <span>Current Value</span>
          <strong>{formatINR(summary.current)}</strong>
        </div>
        <div className="stat-card">
          <span>Total P&L</span>
          <strong className={summary.pnl >= 0 ? 'text-success' : 'text-danger'}>{formatINR(summary.pnl)}</strong>
        </div>
        <div className="stat-card">
          <span>Day P&L</span>
          <strong className={summary.dayPnl >= 0 ? 'text-success' : 'text-danger'}>{formatINR(summary.dayPnl)}</strong>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-label">Portfolio Table</span>
            <h3>All holdings</h3>
          </div>
          <div className="panel-actions">
            <span className="live-pill">Live values auto-refresh</span>
            <button className="button button-secondary" onClick={exportCsv} type="button">
              Export CSV
            </button>
          </div>
        </div>

        {!holdings.length ? (
          <EmptyState title="No holdings found" description="Place a CNC buy order to start building your portfolio." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th><button type="button" onClick={() => toggleSort('name')}>Name / Exchange</button></th>
                  <th><button type="button" onClick={() => toggleSort('qty')}>Qty</button></th>
                  <th><button type="button" onClick={() => toggleSort('avg')}>Avg Price</button></th>
                  <th><button type="button" onClick={() => toggleSort('price')}>LTP</button></th>
                  <th>Current Value</th>
                  <th>P&L (INR)</th>
                  <th>P&L (%)</th>
                  <th>Day Change</th>
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.map((item, index) => {
                  const pnl = (item.price - item.avg) * item.qty;
                  const pnlPercent = ((item.price - item.avg) / item.avg) * 100;

                  return (
                    <tr className={item.isLoss ? 'loss-row' : 'profit-row'} key={item._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="stacked-cell">
                          <button className="stock-link-button" onClick={() => openStockDetail(item)} type="button">
                            {item.name}
                          </button>
                          <span>{item.exchange}</span>
                        </div>
                      </td>
                      <td>{item.qty}</td>
                      <td>{formatINR(item.avg)}</td>
                      <td>{formatINR(item.price)}</td>
                      <td>{formatINR(item.price * item.qty)}</td>
                      <td className={pnl >= 0 ? 'text-success' : 'text-danger'}>{formatINR(pnl)}</td>
                      <td className={pnl >= 0 ? 'text-success' : 'text-danger'}>
                        {pnlPercent >= 0 ? '+' : ''}
                        {pnlPercent.toFixed(2)}%
                      </td>
                      <td className={item.isLoss ? 'text-danger' : 'text-success'}>{item.day}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Holdings;
