import { dashboardRegisterUrl } from '../utils/appUrls';

const featureCards = [
  {
    title: 'Smart Portfolio Tracking',
    description:
      'Monitor holdings, positions, sector allocation, and daily P&L in one airy dashboard designed for fast decision-making.'
  },
  {
    title: 'Indian Market Focus',
    description:
      'Built around NSE and BSE workflows with MIS, CNC, NRML, market context, and INR-first formatting everywhere.'
  },
  {
    title: 'Fast Execution Flows',
    description:
      'Search, watch, buy, sell, add funds, and review orders with minimal clicks and a premium, modern trading experience.'
  }
];

const indices = [
  { label: 'NIFTY 50', value: '22,475.40', change: '+0.68%' },
  { label: 'SENSEX', value: '73,985.12', change: '+0.57%' },
  { label: 'NIFTY BANK', value: '48,210.80', change: '+0.74%' },
  { label: 'NIFTY IT', value: '36,992.25', change: '+1.10%' }
];

function Home() {
  return (
    <div className="site-page">
      <section className="hero-section">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Modern Indian Trading Infrastructure</span>
            <h1>Trade India&apos;s best stocks with a calmer, smarter dashboard.</h1>
            <p>
              Track performance, manage capital, monitor live watchlists, and execute market ideas
              inside a production-ready fintech workflow designed for clarity.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={dashboardRegisterUrl}>
                Start Demo Trading
              </a>
              <a className="button button-secondary" href="/products">
                Explore Products
              </a>
            </div>

            <div className="hero-trust-row">
              <div className="trust-chip">
                <strong>50+</strong>
                <span>Indian stocks in search universe</span>
              </div>
              <div className="trust-chip">
                <strong>24/7</strong>
                <span>Access to portfolio analytics</span>
              </div>
              <div className="trust-chip">
                <strong>INR</strong>
                <span>Native Indian market formatting</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-card">
              <div className="hero-card-header">
                <div>
                  <span className="section-label">Portfolio Snapshot</span>
                  <h3>TradeSphere Prime</h3>
                </div>
                <span className="status-pill status-positive">Market Open</span>
              </div>

              <div className="hero-kpis">
                <div className="metric-card">
                  <span>Total Portfolio</span>
                  <strong>&#8377;6.42L</strong>
                  <small className="status-positive">+2.48% today</small>
                </div>
                <div className="metric-card">
                  <span>Available Funds</span>
                  <strong>&#8377;1.00L</strong>
                  <small className="status-neutral">Ready to deploy</small>
                </div>
              </div>

              <div className="indices-grid">
                {indices.map((item) => (
                  <div className="index-pill" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <small className="status-positive">{item.change}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="site-container">
          <div className="section-head">
            <span className="eyebrow">Why Teams Choose TradeSphere</span>
            <h2>Everything needed for a polished trading platform experience.</h2>
          </div>

          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon" />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section compact-top">
        <div className="site-container split-section">
          <div className="split-copy">
            <span className="eyebrow">Built for Indian Investors</span>
            <h2>Execution-friendly UI, thoughtful analytics, and clean workflows.</h2>
            <p>
              The platform ships with a premium dashboard design language, responsive layout,
              watchlists, funds, admin operations, and portfolio visualizations tailored to Indian
              equities.
            </p>
          </div>

          <div className="comparison-card">
            <div className="comparison-row">
              <span>Order Products</span>
              <strong>MIS, CNC, NRML</strong>
            </div>
            <div className="comparison-row">
              <span>Exchanges</span>
              <strong>NSE, BSE</strong>
            </div>
            <div className="comparison-row">
              <span>Utilities</span>
              <strong>CSV export, charts, admin CRUD</strong>
            </div>
            <div className="comparison-row">
              <span>Security</span>
              <strong>JWT auth + protected routes</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
