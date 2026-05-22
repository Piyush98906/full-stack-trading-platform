import { dashboardRegisterUrl } from '../utils/appUrls';

const indices = [
  { label: 'NIFTY 50', value: '22,475.40', change: '+0.68%' },
  { label: 'SENSEX', value: '73,985.12', change: '+0.57%' },
  { label: 'BANK NIFTY', value: '48,210.80', change: '+0.74%' },
  { label: 'NIFTY IT', value: '36,992.25', change: '+1.10%' }
];

const watchlistRows = [
  { symbol: 'RELIANCE', price: '2,962.80', change: '+1.09%', volume: '3.2M' },
  { symbol: 'INFY', price: '1,510.00', change: '+1.23%', volume: '2.1M' },
  { symbol: 'HDFCBANK', price: '1,590.00', change: '-0.55%', volume: '4.7M' },
  { symbol: 'TATAMOTORS', price: '1,012.15', change: '+1.76%', volume: '5.4M' }
];

const trustItems = [
  ['Secure sessions', 'JWT-based protected dashboard routes'],
  ['Order audit trail', 'Executed, pending, and closed trade history'],
  ['Market fallback', 'Platform remains stable when provider data is unavailable']
];

function Home() {
  return (
    <div className="site-page">
      <section className="hero-section">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Trading simulation platform</span>
            <h1>TradeSphere</h1>
            <p>
              A compact Indian-market trading workspace with watchlists, positions, holdings,
              order history, funds, and chart-driven stock inspection for trading workflows.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={dashboardRegisterUrl}>
                Open Trading Dashboard
              </a>
              <a className="button button-secondary" href="/products">
                View Product Stack
              </a>
            </div>
          </div>

          <div className="terminal-preview" aria-label="Trading dashboard preview">
            <div className="preview-topbar">
              <strong>Market Snapshot</strong>
              <span>Indian equity workspace</span>
            </div>
            <div className="preview-kpis">
              <div>
                <span>Portfolio</span>
                <strong>&#8377;6.42L</strong>
              </div>
              <div>
                <span>Today P&L</span>
                <strong className="text-success">+&#8377;8,420</strong>
              </div>
              <div>
                <span>Funds</span>
                <strong>&#8377;1.00L</strong>
              </div>
            </div>
            <div className="preview-chart">
              <span className="preview-bar-44" />
              <span className="preview-bar-68" />
              <span className="preview-bar-52" />
              <span className="preview-bar-76" />
              <span className="preview-bar-61" />
              <span className="preview-bar-84" />
              <span className="preview-bar-58" />
              <span className="preview-bar-72" />
            </div>
            <table className="preview-table">
              <tbody>
                {watchlistRows.map((row) => (
                  <tr key={row.symbol}>
                    <td>{row.symbol}</td>
                    <td>{row.price}</td>
                    <td className={row.change.startsWith('-') ? 'text-danger' : 'text-success'}>{row.change}</td>
                    <td>{row.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="market-strip">
        <div className="site-container market-strip-inner">
          {indices.map((item) => (
            <div className="index-pill" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small className="text-success">{item.change}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="site-container split-section">
          <div className="section-head">
            <span className="eyebrow">Trust without fake claims</span>
            <h2>Built around traceable trade flows and clear account state.</h2>
            <p>
              The platform avoids invented regulatory badges and focuses on credible product signals:
              session security, transaction history, transparent order states, and reliable fallback data.
            </p>
          </div>

          <div className="trust-list">
            {trustItems.map(([title, body]) => (
              <div className="trust-card" key={title}>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
