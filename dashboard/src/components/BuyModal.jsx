import { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { formatINR } from '../utils/format';
import { useToast } from '../context/ToastContext';

function BuyModal({ open, stock, mode: initialMode = 'buy', onClose, onSuccess, availableFunds = 0 }) {
  const { addToast } = useToast();
  const [mode, setMode] = useState(initialMode);
  const [orderType, setOrderType] = useState('market');
  const [product, setProduct] = useState('CNC');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(stock?.price || 0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !stock) {
      return;
    }

    setMode(initialMode);
    setOrderType('market');
    setProduct(initialMode === 'sell' ? 'CNC' : 'CNC');
    setQty(1);
    setPrice(stock.price || 0);

    const fetchQuote = async () => {
      try {
        const { data } = await api.get(`/stocks/quote/${encodeURIComponent(stock.symbol)}`, {
          params: {
            instrumentKey: stock.instrumentKey,
            exchange: stock.exchange,
            name: stock.name,
            sector: stock.sector
          }
        });
        setPrice(data.stock.price);
      } catch (error) {
        setPrice(stock.price || 0);
      }
    };

    fetchQuote();
  }, [open, stock, initialMode]);

  const estimate = useMemo(() => Number(qty || 0) * Number(price || 0), [qty, price]);

  if (!open || !stock) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const { data } = await api.post('/orders/new', {
        name: stock.symbol,
        companyName: stock.name,
        exchange: stock.exchange,
        instrumentKey: stock.instrumentKey,
        sector: stock.sector,
        qty: Number(qty),
        price: Number(price),
        mode,
        orderType,
        product
      });
      addToast(data.message || 'Order placed successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="buy-modal">
        <div className="modal-header">
          <div>
            <span className="section-label">Execution Ticket</span>
            <h2>
              {stock.symbol} <span className="text-muted">· {stock.exchange}</span>
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="tab-row">
          {['buy', 'sell'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-pill ${mode === tab ? (tab === 'buy' ? 'tab-buy' : 'tab-sell') : ''}`}
              onClick={() => setMode(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="field-block">
            <label>Order Type</label>
            <div className="pill-group">
              {[
                { label: 'Market', value: 'market' },
                { label: 'Limit', value: 'limit' },
                { label: 'SL', value: 'sl' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={`choice-pill ${orderType === item.value ? 'active' : ''}`}
                  onClick={() => setOrderType(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-block">
            <label>Product Type</label>
            <div className="pill-group">
              {['MIS', 'CNC', 'NRML'].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`choice-pill ${product === item ? 'active' : ''}`}
                  onClick={() => setProduct(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid two">
            <div className="field-block">
              <label>Quantity</label>
              <div className="quantity-control">
                <button type="button" onClick={() => setQty((current) => Math.max(1, current - 1))}>
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(event) => setQty(Math.max(1, Number(event.target.value || 1)))}
                />
                <button type="button" onClick={() => setQty((current) => current + 1)}>
                  +
                </button>
              </div>
            </div>

            <div className="field-block">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                disabled={orderType === 'market'}
                onChange={(event) => setPrice(Number(event.target.value || 0))}
              />
            </div>
          </div>

          <div className="estimation-card">
            <div className="comparison-row">
              <span>Est. Value</span>
              <strong>{formatINR(estimate)}</strong>
            </div>
            <div className="comparison-row">
              <span>Available Margin</span>
              <strong>{formatINR(availableFunds)}</strong>
            </div>
          </div>

          <button
            className={`button full-width ${mode === 'buy' ? 'button-primary' : 'button-danger'}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Placing Order...' : `Place ${mode.toUpperCase()} Order`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BuyModal;
