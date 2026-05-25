import { startTransition, useEffect, useMemo, useState } from 'react';
import BuyModal from '../components/BuyModal';
import EmptyState from '../components/EmptyState';
import StockSearch from '../components/StockSearch';
import { useStockDetail } from '../context/StockDetailContext';
import api from '../utils/api';
import { formatCompact, formatINR } from '../utils/format';

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
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-label">Watchlist</span>
            <h3>Market scanner</h3>
          </div>
        </div>

        <StockSearch onSelect={addToWatchlist} />
      </section>

      <section className="watchlist-table-panel">
        <div className="watchlist-toolbar">
          <div>
            <span className="section-label">Trading Desk</span>
            <h3>Saved instruments</h3>
          </div>
          <button className="button button-secondary" onClick={() => refreshWatchlist()} type="button">
            Refresh
          </button>
        </div>

        {sortedWatchlist.length === 0 ? (
          <EmptyState
            title="No watchlist items yet"
            description="Search by stock symbol or company name and add names to your watchlist."
          />
        ) : (
          <div className="table-wrap">
            <table className="watchlist-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th className="num-cell">Price</th>
                  <th className="num-cell">Change</th>
                  <th className="num-cell">Volume</th>
                  <th>Feed</th>
                  <th className="num-cell">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedWatchlist.map((stock) => (
                  <tr key={getWatchlistKey(stock)}>
                    <td>
                      <div className="watchlist-symbol">
                        <button className="watchlist-symbol-button" onClick={() => openStockDetail(stock)} type="button">
                          {stock.symbol}
                        </button>
                        <small>{stock.name}</small>
                      </div>
                    </td>
                    <td className="num-cell">{formatINR(stock.price)}</td>
                    <td className={`num-cell ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change.toFixed(2)}%
                    </td>
                    <td className="num-cell">{formatCompact(stock.volume || 0)}</td>
                    <td>
                      <span className="exchange-badge">{stock.source === 'upstox' ? 'Upstox' : 'Market Feed'}</span>
                    </td>
                    <td>
                      <div className="watchlist-actions watchlist-actions-end">
                        <button
                          className="button button-primary"
                          onClick={() => setSelectedTrade({ stock, mode: 'buy' })}
                          type="button"
                        >
                          Buy
                        </button>
                        <button
                          className="button button-danger"
                          onClick={() => setSelectedTrade({ stock, mode: 'sell' })}
                          type="button"
                        >
                          Sell
                        </button>
                        <button
                          className="button button-ghost"
                          onClick={() => removeFromWatchlist(stock)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
