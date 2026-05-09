import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useStockDetail } from '../context/StockDetailContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatINR } from '../utils/format';

function Positions() {
  const { openStockDetail } = useStockDetail();
  const { addToast } = useToast();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/positions');
      setPositions(data.positions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const summary = useMemo(() => {
    const totalPnl = positions.reduce((sum, item) => sum + (item.price - item.avg) * item.qty, 0);
    return {
      count: positions.length,
      totalPnl
    };
  }, [positions]);

  const closePosition = async (position) => {
    try {
      await api.post('/orders/new', {
        name: position.name,
        qty: position.qty,
        price: position.price,
        mode: 'sell',
        orderType: 'market',
        product: position.product
      });
      addToast('Position closed successfully!', 'success');
      fetchPositions();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to close position', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading positions..." />;
  }

  return (
    <div className="page-stack">
      <section className="summary-grid two">
        <div className="stat-card">
          <span>Open Positions</span>
          <strong>{summary.count}</strong>
        </div>
        <div className="stat-card">
          <span>Total P&amp;L</span>
          <strong className={summary.totalPnl >= 0 ? 'text-success' : 'text-danger'}>
            {formatINR(summary.totalPnl)}
          </strong>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-label">Open Positions</span>
            <h3>Intraday and carry-forward exposures</h3>
          </div>
        </div>

        {!positions.length ? (
          <EmptyState title="No open positions" description="MIS and NRML trades will appear here." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Avg</th>
                  <th>LTP</th>
                  <th>P&amp;L</th>
                  <th>Day Change</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((item) => {
                  const pnl = (item.price - item.avg) * item.qty;
                  return (
                    <tr className={item.isLoss ? 'position-loss-row' : ''} key={item._id}>
                      <td><span className={`pill-badge badge-${item.product.toLowerCase()}`}>{item.product}</span></td>
                      <td>
                        <button className="stock-link-button" onClick={() => openStockDetail(item.name)} type="button">
                          {item.name}
                        </button>
                      </td>
                      <td>{item.qty}</td>
                      <td>{formatINR(item.avg)}</td>
                      <td>{formatINR(item.price)}</td>
                      <td className={pnl >= 0 ? 'text-success' : 'text-danger'}>{formatINR(pnl)}</td>
                      <td className={item.isLoss ? 'text-danger' : 'text-success'}>{item.day}</td>
                      <td>{item.isLoss ? 'Open - Loss' : 'Open - Profit'}</td>
                      <td>
                        <button className="button button-danger" onClick={() => closePosition(item)} type="button">
                          Close Position
                        </button>
                      </td>
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

export default Positions;
