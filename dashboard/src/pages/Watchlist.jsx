import { startTransition, useEffect, useMemo, useState } from 'react';
import BuyModal from '../components/BuyModal';
import EmptyState from '../components/EmptyState';
import StockSearch from '../components/StockSearch';
import { useStockDetail } from '../context/StockDetailContext';
import api from '../utils/api';
import { formatINR } from '../utils/format';

const WATCHLIST_KEY = 'tp_watchlist';
const getWatchlistKey = (item) => item.instrumentKey || `${item.symbol}-${item.exchange}`;

function Watchlist() {
  const { openStockDetail } = useStockDetail();
  const [watchlist, setWatchlist] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [availableFunds, setAvailableFunds] = useState(0);

  const persistWatchlist = (items) => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
    setWatchlist(items);
  };

  const fetchFunds = async () => {
    try {
      const { data } = await api.get('/funds');
      setAvailableFunds(data.available);
    } catch (error) {
      setAvailableFunds(0);
    }
  };

  const refreshWatchlist = async (items = watchlist) => {
    if (!items.length) {
      return;
    }

    const refreshed = await Promise.all(
      items.map(async (item) => {
        try {
          const { data } = await api.get(`/stocks/quote/${encodeURIComponent(item.symbol)}`, {
            params: {
              instrumentKey: item.instrumentKey,
              exchange: item.exchange,
              name: item.name,
              sector: item.sector
            }
          });
          return data.stock;
        } catch (error) {
          return item;
        }
      })
    );

    persistWatchlist(refreshed);
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
    setWatchlist(stored);
    fetchFunds();
  }, []);

  useEffect(() => {
    if (!watchlist.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      refreshWatchlist();
    }, 10000);

    return () => {
      window.clearInterval(timer);
    };
  }, [watchlist]);

  const addToWatchlist = async (stock) => {
    const stockKey = getWatchlistKey(stock);
    const exists = watchlist.some((item) => getWatchlistKey(item) === stockKey);

    if (exists) {
      return;
    }

    try {
      const { data } = await api.get(`/stocks/quote/${encodeURIComponent(stock.symbol)}`, {
        params: {
          instrumentKey: stock.instrumentKey,
          exchange: stock.exchange,
          name: stock.name,
          sector: stock.sector
        }
      });
      startTransition(() => {
        persistWatchlist([...watchlist, data.stock]);
      });
    } catch (error) {
      persistWatchlist([...watchlist, stock]);
    }
  };

  const removeFromWatchlist = (stockToRemove) => {
    persistWatchlist(watchlist.filter((item) => getWatchlistKey(item) !== getWatchlistKey(stockToRemove)));
  };

  const sortedWatchlist = useMemo(
    () => [...watchlist].sort((a, b) => a.symbol.localeCompare(b.symbol)),
    [watchlist]
  );

  return (
    <div className="page-stack">
      <div className="panel-card">
        <div className="panel-head">
          <div style={{ marginBottom: '16px' }}>
            <span className="section-label">Discover Stocks</span>
            <h3>Your watchlist</h3>
          </div>
          <span className="live-pill">Auto-refreshing every 10 seconds</span>
        </div>

        <StockSearch onSelect={addToWatchlist} />
      </div>

      <section className="watchlist-grid">
        {sortedWatchlist.length === 0 ? (
          <div className="panel-card">
            <EmptyState
              title="No watchlist items yet"
              description="Search by stock symbol or company name and add names to your watchlist."
            />
          </div>
        ) : (
          sortedWatchlist.map((stock) => (
            <article
              className="watchlist-card watchlist-clickable"
              key={getWatchlistKey(stock)}
              onClick={() => openStockDetail(stock)}
            >
              <div className="watchlist-head">
                <div>
                  <strong>{stock.symbol}</strong>
                  <p>{stock.name}</p>
                </div>
                <span className="exchange-badge">{stock.exchange}</span>
              </div>

              <div className="watchlist-price">
                <h3>{formatINR(stock.price)}</h3>
                <span className={stock.change >= 0 ? 'text-success' : 'text-danger'}>
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)}%
                </span>
              </div>

              <div className="watchlist-meta-grid">
                <div className="watchlist-meta-card">
                  <span>Sector</span>
                  <strong>{stock.sector || 'Equity'}</strong>
                </div>
                <div className="watchlist-meta-card">
                  <span>Feed</span>
                  <strong>{stock.source === 'upstox' ? 'Live' : 'Demo Live'}</strong>
                </div>
              </div>

              <div className="watchlist-actions">
                <button
                  className="button button-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedTrade({ stock, mode: 'buy' });
                  }}
                  type="button"
                >
                  Buy
                </button>
                <button
                  className="button button-danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedTrade({ stock, mode: 'sell' });
                  }}
                  type="button"
                >
                  Sell
                </button>
                <button
                  className="button button-ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFromWatchlist(stock);
                  }}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <BuyModal
        open={Boolean(selectedTrade)}
        stock={selectedTrade?.stock}
        mode={selectedTrade?.mode}
        onClose={() => setSelectedTrade(null)}
        onSuccess={() => refreshWatchlist()}
        availableFunds={availableFunds}
      />
    </div>
  );
}

export default Watchlist;
