import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import KPICard from '../components/KPICard';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatINR } from '../utils/format';

const paymentMethods = ['UPI', 'Net Banking', 'NEFT/RTGS'];

function Funds() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState(null);
  const [addForm, setAddForm] = useState({ amount: '', method: 'UPI', upiId: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/funds');
      setFunds(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const utilisation = useMemo(() => {
    if (!funds) {
      return 0;
    }

    const total = funds.available + funds.used + funds.collateral;
    return total > 0 ? Math.min(100, (funds.used / total) * 100) : 0;
  }, [funds]);

  const handleAddFunds = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await api.post('/funds/add', addForm);
      addToast('Funds added successfully!', 'success');
      setAddForm({ amount: '', method: addForm.method, upiId: '' });
      fetchFunds();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to add funds', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawFunds = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await api.post('/funds/withdraw', { amount: withdrawAmount });
      addToast('Withdrawal successful!', 'success');
      setWithdrawAmount('');
      fetchFunds();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to withdraw funds', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading funds..." />;
  }

  return (
    <div className="page-stack">
      <section className="kpi-grid">
        <KPICard title="Available Cash" value={formatINR(funds.available)} icon="₹" tone="primary" />
        <KPICard title="Collateral" value={formatINR(funds.collateral)} icon="◌" tone="warning" />
        <KPICard title="Used Margin" value={formatINR(funds.used)} icon="▤" tone="danger" />
        <KPICard title="Total Balance" value={formatINR(funds.total)} icon="◫" tone="success" />
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-label">Margin Utilisation</span>
            <h3>Capital deployment</h3>
          </div>
          <strong>{utilisation.toFixed(0)}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${utilisation}%` }} />
        </div>
      </section>

      <section className="content-grid two-col">
        <form className="panel-card form-card" onSubmit={handleAddFunds}>
          <div className="panel-head">
            <div>
              <span className="section-label">Add Funds</span>
              <h3>Top up your account</h3>
            </div>
          </div>

          <label>
            Amount
            <input
              type="number"
              value={addForm.amount}
              onChange={(event) => setAddForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="Enter amount"
            />
          </label>

          <div className="field-block">
            <label>Payment Method</label>
            <div className="pill-group">
              {paymentMethods.map((method) => (
                <button
                  type="button"
                  className={`choice-pill ${addForm.method === method ? 'active' : ''}`}
                  key={method}
                  onClick={() => setAddForm((current) => ({ ...current, method }))}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {addForm.method === 'UPI' && (
            <label>
              UPI ID
              <input
                type="text"
                value={addForm.upiId}
                onChange={(event) => setAddForm((current) => ({ ...current, upiId: event.target.value }))}
                placeholder="yourname@bank"
              />
            </label>
          )}

          <button className="button button-primary full-width" type="submit" disabled={submitting}>
            Add Funds
          </button>
        </form>

        <form className="panel-card form-card" onSubmit={handleWithdrawFunds}>
          <div className="panel-head">
            <div>
              <span className="section-label">Withdraw Funds</span>
              <h3>Move cash out safely</h3>
            </div>
          </div>

          <label>
            Amount
            <input
              type="number"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              placeholder="Enter withdrawal amount"
            />
          </label>

          <button className="button button-danger full-width" type="submit" disabled={submitting}>
            Withdraw Funds
          </button>
        </form>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-label">Transaction History</span>
            <h3>Recent ledger activity</h3>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {funds.transactions.map((item) => (
                <tr key={item._id || item.reference}>
                  <td>{new Date(item.createdAt).toLocaleString('en-IN')}</td>
                  <td>{item.type === 'credit' ? 'Credit' : 'Debit'}</td>
                  <td>{item.method}</td>
                  <td>{formatINR(item.amount)}</td>
                  <td>
                    <span className={`pill-badge badge-${item.status}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Funds;
