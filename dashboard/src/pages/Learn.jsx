const tradingSteps = [
  {
    title: '1. Build a watchlist',
    body: 'Start by tracking a few stocks you understand. Compare price, day change, sector, and how the stock reacts during the session before placing any trade.'
  },
  {
    title: '2. Open the stock detail view',
    body: 'Check the company summary, 52-week range, previous close, and the intraday chart. This helps beginners avoid buying a stock only because it is moving fast.'
  },
  {
    title: '3. Choose the right product',
    body: 'Use MIS for intraday trades, CNC for delivery investing, and NRML for carry-forward style exposure. Product choice decides where the trade appears in the app.'
  },
  {
    title: '4. Select order type carefully',
    body: 'Market orders execute near the current price, limit orders wait for your chosen price, and stop-loss orders are used to protect capital if the trade goes wrong.'
  },
  {
    title: '5. Manage risk before profit',
    body: 'Decide your maximum loss, trade quantity, and exit plan first. Good trading is less about prediction and more about controlling downside.'
  }
];

const tradingBasics = [
  ['MIS', 'Intraday product. Positions open in the Positions tab and are usually closed the same day.'],
  ['CNC', 'Delivery product. Long-term holdings appear in the Holdings tab.'],
  ['NRML', 'Carry-forward style exposure for trades you do not want to treat as delivery.'],
  ['LTP', 'Last Traded Price, the most recent market price available.'],
  ['Stop-loss', 'A risk-control order used to limit losses if price moves against you.'],
  ['P&L', 'Profit and Loss. Positive means profit, negative means loss.']
];

const beginnerChecklist = [
  'Trade only after checking trend, support/resistance, and sector context.',
  'Never place a large quantity just because margin is available.',
  'Keep emotions out of the decision and follow a fixed entry/exit plan.',
  'Use stop-loss and position sizing as your first layer of protection.',
  'Review both winning and losing trades to learn what worked.'
];

function Learn() {
  return (
    <div className="page-stack">
      <section className="page-hero learn-hero">
        <div>
          <span className="section-label">Beginner Guide</span>
          <h2 className="page-heading">Learn how to trade before you click buy or sell</h2>
          <p className="page-subtitle">
            This section is designed for first-time users who want to understand market basics,
            platform flow, and safe trade execution habits.
          </p>
        </div>
        <div className="learn-highlight">
          <strong>Golden Rule</strong>
          <p>Capital protection comes first. A disciplined small loss is better than an emotional big loss.</p>
        </div>
      </section>

      <section className="learn-grid">
        {tradingSteps.map((step) => (
          <article className="panel-card learn-card" key={step.title}>
            <span className="section-label">Workflow</span>
            <h3>{step.title}</h3>
            <p className="page-subtitle">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="content-grid two-col">
        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Trading Terms</span>
              <h3>Meaning of the main platform words</h3>
            </div>
          </div>

          <div className="learn-term-list">
            {tradingBasics.map(([label, description]) => (
              <div className="comparison-row learn-term-row" key={label}>
                <strong>{label}</strong>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">Risk Checklist</span>
              <h3>What beginners should confirm before trading</h3>
            </div>
          </div>

          <div className="learn-checklist">
            {beginnerChecklist.map((item) => (
              <div className="learn-check-item" key={item}>
                <span className="learn-check-badge">OK</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Learn;
