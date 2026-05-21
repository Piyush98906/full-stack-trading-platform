import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useStockDetail } from '../context/StockDetailContext';
import api from '../utils/api';
import { formatINR } from '../utils/format';

const filters = ['all', 'buy', 'sell', 'today', 'week'];

function Orders() {
  const { openStockDetail } = useStockDetail();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchOrders = async (withSpinner = false) => {
    try {
      if (withSpinner) {
        setLoading(true);
      }

      const { data } = await api.get('/orders');
      setOrders(data.orders);
    } finally {
      if (withSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders(true);

    const timer = window.setInterval(() => {
      fetchOrders(false);
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      if (activeFilter === 'buy' || activeFilter === 'sell') {
        return order.mode === activeFilter;
      }
      if (activeFilter === 'today') {
        return createdAt.toDateString() === now.toDateString();
      }
      if (activeFilter === 'week') {
        return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }, [orders, activeFilter]);

  if (loading) {
    return <LoadingSpinner label="Loading orders..." />;
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-head">
          <div className="filter-tabs">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`tab-pill ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all'
                  ? 'All'
                  : filter === 'buy'
                    ? 'Buy'
                    : filter === 'sell'
                      ? 'Sell'
                      : filter === 'today'
                        ? 'Today'
                        : 'This Week'}
              </button>
            ))}
          </div>
        </div>

        {!filteredOrders.length ? (
          <EmptyState title="No orders yet" description="Placed orders will appear here with execution status." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Mode</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Realized P&L</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{new Date(order.createdAt).toLocaleString('en-IN')}</td>
                    <td>
                      <button className="stock-link-button" onClick={() => openStockDetail(order.name)} type="button">
                        {order.name}
                      </button>
                    </td>
                    <td>
                      <span className={`pill-badge ${order.mode === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
                        {order.mode.toUpperCase()}
                      </span>
                    </td>
                    <td><span className={`pill-badge badge-${order.product.toLowerCase()}`}>{order.product}</span></td>
                    <td>{order.qty}</td>
                    <td>{formatINR(order.price)}</td>
                    <td>{formatINR(order.qty * order.price)}</td>
                    <td className={Number(order.realizedPnl || 0) >= 0 ? 'text-success' : 'text-danger'}>
                      {Number(order.realizedPnl || 0) === 0 ? 'N/A' : formatINR(order.realizedPnl)}
                    </td>
                    <td>
                      <span className={`pill-badge badge-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Orders;
