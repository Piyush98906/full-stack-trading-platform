import { dashboardRegisterUrl } from '../utils/appUrls';

const indices = [
  { label: 'NIFTY 50', value: '22,475.40', change: '+0.68%' },
  { label: 'SENSEX', value: '73,985.12', change: '+0.57%' },
  { label: 'BANK NIFTY', value: '48,210.80', change: '+0.74%' },
  { label: 'NIFTY IT', value: '36,992.25', change: '+1.10%' }
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

          <div className="hero-showcase" aria-label="Trading workspace highlights">
            <div className="hero-showcase-card hero-showcase-primary">
              <span className="eyebrow">Built For Practice</span>
              <h3>Learn market structure, build conviction, and execute with clarity.</h3>
              <p>
                Watchlists, positions, holdings, charts, and funds come together in one beginner-friendly workflow.
              </p>
            </div>

            <div className="hero-showcase-grid">
              <div className="hero-showcase-card">
                <span>Watchlists</span>
                <strong>Sector-led scanning</strong>
                <p>Track leaders, laggards, and the names you want to study daily.</p>
              </div>
              <div className="hero-showcase-card">
                <span>Execution</span>
                <strong>Simple order flow</strong>
                <p>Place CNC, MIS, and NRML trades with focused order tickets.</p>
              </div>
              <div className="hero-showcase-card">
                <span>Risk View</span>
                <strong>Clear portfolio state</strong>
                <p>See holdings, open positions, and funds without hunting through tabs.</p>
              </div>
            </div>
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
