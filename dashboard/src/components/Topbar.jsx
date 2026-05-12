import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStockDetail } from '../context/StockDetailContext';
import api from '../utils/api';
import { formatINR, getAvatarColor } from '../utils/format';
import { getMarketStatus, staticIndices } from '../utils/market';

const titles = {
  '/dashboard': 'Dashboard',
  '/watchlist': 'Watchlist',
  '/holdings': 'Holdings',
  '/positions': 'Positions',
  '/orders': 'Orders',
  '/funds': 'Funds',
  '/summary': 'Summary',
  '/profile': 'Profile',
  '/admin': 'Admin Panel'
};

function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { openStockDetail } = useStockDetail();
  const marketStatus = getMarketStatus();
  const title = titles[pathname] || 'Trading Platform';
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [indices, setIndices] = useState(staticIndices);

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
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [deferredQuery]);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const { data } = await api.get('/stocks/market-overview');
        if (Array.isArray(data.indices) && data.indices.length > 0) {
          setIndices(data.indices);
        }
      } catch (error) {
        setIndices(staticIndices);
      }
    };

    fetchIndices();
  }, []);

  const handleResultClick = (stock) => {
    startTransition(() => {
      openStockDetail(stock);
      setQuery('');
      setResults([]);
    });
  };

  return (
    <header className="topbar">
      <div className="topbar-row">
        <div className="topbar-left">
          <button className="icon-button mobile-only" onClick={onMenuClick} type="button">
            Menu
          </button>
          <div>
            <span className="section-label">{title}</span>
            <h1 className="topbar-title">{title}</h1>
          </div>
        </div>

        <div className="topbar-search">
          <div className="search-input-wrap">
            <span className="search-icon"> <i class="fa fa-search"></i></span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stocks, indices, and symbols..."
            />
          </div>

          {(query || loading || results.length > 0) && (
            <div className="search-results topbar-search-results">
              {loading && <div className="search-item muted">Searching stocks...</div>}
              {!loading && results.length === 0 && (
                <div className="search-item muted">No matching stocks found.</div>
              )}
              {!loading &&
                results.map((stock) => (
                  <button
                    className="search-item search-button"
                    key={stock.instrumentKey || `${stock.symbol}-${stock.exchange}`}
                    onClick={() => handleResultClick(stock)}
                    type="button"
                  >
                    <div>
                      <strong>{stock.symbol}</strong>
                      <p>{stock.name}</p>
                    </div>
                    <div className="search-meta">
                      <span className="exchange-badge">{stock.exchange}</span>
                      <strong>{formatINR(stock.price)}</strong>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="topbar-user">
          <span className={`status-pill ${marketStatus.isOpen ? 'status-positive' : 'status-warning'}`}>
            {marketStatus.label}
          </span>
          <div className="avatar-pill">
            <div className="avatar-circle" style={{ backgroundColor: getAvatarColor(user?.name) }}>
              {(user?.name || 'T').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user?.name}</strong>
              <small>{formatINR(user?.funds || 0)}</small>
            </div>
          </div>
        </div>
      </div>

      <div className="indices-strip">
        {indices.slice(0, 4).map((index) => (
          <button className="index-chip index-chip-button" key={index.symbol} onClick={() => openStockDetail(index)} type="button">
            <span>{index.symbol}  </span>
            <strong>{Number(index.price ?? index.value ?? 0).toLocaleString('en-IN')} </strong>
            <small className={index.change >= 0 ? 'text-success' : 'text-danger'}>
              {index.change >= 0 ? '+' : ''}
              {index.change.toFixed(2)}%  
            </small>
          </button>
        ))}
      </div>
    </header>
  );
}

export default Topbar;
