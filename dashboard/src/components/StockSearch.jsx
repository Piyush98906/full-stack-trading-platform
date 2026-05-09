import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import api from '../utils/api';
import { formatINR } from '../utils/format';

function StockSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!String(deferredQuery).trim()) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/stocks/search?q=${encodeURIComponent(deferredQuery)}`, {
          signal: controller.signal
        });
        setResults(data.stocks);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [deferredQuery]);

  const handleSelect = (stock) => {
    startTransition(() => {
      onSelect(stock);
      setQuery('');
      setResults([]);
    });
  };

  return (
    <div className="search-shell">
      <div className="search-input-wrap">
        <span className="search-icon" style={{ marginRight: "8px" }}>  <i class="fa fa-search"></i></span>
        <input
        
          className="search-input"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stocks by name or symbol..."
        />
      </div>

      {(query || loading || results.length > 0) && (
        <div className="search-results">
          {loading && <div className="search-item muted">Searching stocks...</div>}
          {!loading && results.length === 0 && (
            <div className="search-item muted">No stocks matched your search.</div>
          )}
          {!loading &&
            results.map((stock) => (
              <button
                className="search-item search-button"
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                type="button"
              >
                <div>
                  <strong>{stock.symbol}</strong>
                  <p>{stock.name}</p>
                </div>
                <div className="search-meta">
                  <span className="exchange-badge">{stock.exchange}</span>
                  <strong>{formatINR(stock.price)}</strong>
                  <small className={stock.change >= 0 ? 'text-success' : 'text-danger'}>
                    {stock.change >= 0 ? '+' : ''}
                    {stock.change.toFixed(2)}%
                  </small>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default StockSearch;
