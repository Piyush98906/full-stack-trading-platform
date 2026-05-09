import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatINR } from '../utils/format';

const tabs = ['orders', 'holdings', 'positions', 'users'];

function AdminPanel() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, orders: 0, holdings: 0, positions: 0 });
  const [orders, setOrders] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [holdingDraft, setHoldingDraft] = useState({
    userId: '',
    name: '',
    qty: '',
    avg: '',
    price: '',
    net: '+0.00%',
    day: '+0.00%',
    isLoss: false,
    sector: 'IT',
    exchange: 'NSE'
  });

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsResponse, ordersResponse, holdingsResponse, positionsResponse, usersResponse] =
        await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/orders'),
          api.get('/admin/holdings'),
          api.get('/admin/positions'),
          api.get('/admin/users')
        ]);

      setStats(statsResponse.data);
      setOrders(ordersResponse.data.orders);
      setHoldings(holdingsResponse.data.holdings);
      setPositions(positionsResponse.data.positions);
      setUsers(usersResponse.data.users);
      if (!holdingDraft.userId && usersResponse.data.users[0]) {
        setHoldingDraft((current) => ({ ...current, userId: usersResponse.data.users[0]._id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const createHolding = async () => {
    try {
      await api.post('/admin/holdings', {
        ...holdingDraft,
        qty: Number(holdingDraft.qty),
        avg: Number(holdingDraft.avg),
        price: Number(holdingDraft.price),
        isLoss: String(holdingDraft.net).startsWith('-')
      });
      addToast('Holding created successfully', 'success');
      setHoldingDraft((current) => ({
        ...current,
        name: '',
        qty: '',
        avg: '',
        price: '',
        net: '+0.00%',
        day: '+0.00%'
      }));
      fetchAdminData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create holding', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading admin data..." />;
  }

  return (
    <div className="page-stack">
      <section className="page-hero admin-hero">
        <div>
          <span className="status-pill status-warning">🔐 Admin View</span>
          <h2 className="page-heading">Operational control center</h2>
        </div>
      </section>

      <section className="summary-grid four">
        <div className="stat-card"><span>Total Users</span><strong>{stats.users}</strong></div>
        <div className="stat-card"><span>Total Orders</span><strong>{stats.orders}</strong></div>
        <div className="stat-card"><span>Total Holdings</span><strong>{stats.holdings}</strong></div>
        <div className="stat-card"><span>Total Positions</span><strong>{stats.positions}</strong></div>
      </section>

      <section className="panel-card">
        <div className="filter-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'orders' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Symbol</th>
                  <th>Mode</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.userId?.email}</td>
                    <td>{order.name}</td>
                    <td>{order.mode}</td>
                    <td>{order.product}</td>
                    <td>{order.qty}</td>
                    <td>{formatINR(order.price)}</td>
                    <td>
                      <span className={`pill-badge badge-${order.status}`}>{order.status}</span>
                    </td>
                    <td className="action-cell">
                      <span className="pill-badge badge-pending">View only</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'holdings' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Symbol</th>
                  <th>Qty</th>
                  <th>Avg</th>
                  <th>LTP</th>
                  <th>Sector</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <select
                      value={holdingDraft.userId}
                      onChange={(event) =>
                        setHoldingDraft((current) => ({ ...current, userId: event.target.value }))
                      }
                    >
                      {users.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.email}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={holdingDraft.name}
                      onChange={(event) => setHoldingDraft((current) => ({ ...current, name: event.target.value.toUpperCase() }))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={holdingDraft.qty}
                      onChange={(event) => setHoldingDraft((current) => ({ ...current, qty: event.target.value }))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={holdingDraft.avg}
                      onChange={(event) => setHoldingDraft((current) => ({ ...current, avg: event.target.value }))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={holdingDraft.price}
                      onChange={(event) => setHoldingDraft((current) => ({ ...current, price: event.target.value }))}
                    />
                  </td>
                  <td>
                    <input
                      value={holdingDraft.sector}
                      onChange={(event) => setHoldingDraft((current) => ({ ...current, sector: event.target.value }))}
                    />
                  </td>
                  <td>
                    <button className="button button-primary" onClick={createHolding} type="button">
                      Add Holding
                    </button>
                  </td>
                </tr>
                {holdings.map((holding) => (
                  <tr key={holding._id}>
                    <td>{holding.userId?.email}</td>
                    <td>{holding.name}</td>
                    <td>{holding.qty}</td>
                    <td>{formatINR(holding.avg)}</td>
                    <td>{formatINR(holding.price)}</td>
                    <td>{holding.sector}</td>
                    <td className="action-cell">
                      <span className="pill-badge badge-pending">View only</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Symbol</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Day</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position._id}>
                    <td>{position.userId?.email}</td>
                    <td>{position.name}</td>
                    <td>{position.product}</td>
                    <td>{position.qty}</td>
                    <td>{formatINR(position.price)}</td>
                    <td className={position.isLoss ? 'text-danger' : 'text-success'}>{position.day}</td>
                    <td>
                      <span className="pill-badge badge-pending">View only</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Member Since</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`pill-badge ${item.role === 'admin' ? 'badge-buy' : 'badge-executed'}`}>
                        {item.role}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString('en-IN')}</td>
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

export default AdminPanel;
