const learningTracks = [
  {
    title: '1. Start with the trend',
    body: 'Check whether the stock is making higher highs, lower lows, or simply moving sideways. Trading with the broader trend usually gives beginners cleaner decisions.'
  },
  {
    title: '2. Read support and resistance',
    body: 'Support is the zone where buyers often step in, while resistance is where price can struggle. These levels help with entries, exits, and stop-loss placement.'
  },
  {
    title: '3. Study volume with price',
    body: 'A strong move with healthy volume is more believable than a price move happening on weak participation. Volume often confirms conviction.'
  },
  {
    title: '4. Respect risk first',
    body: 'Decide how much you are willing to lose before thinking about profit. Position sizing and stop-loss discipline are what keep traders in the game.'
  },
  {
    title: '5. Build a trading journal',
    body: 'Write down why you entered, where you exited, and what you felt. Good traders improve because they review patterns in their own behavior.'
  }
];

const factorCards = [
  ['Business quality', 'Look for understandable businesses with durable demand, good management reputation, and consistent execution.'],
  ['Financial strength', 'Check revenue growth, profit growth, debt levels, return ratios, and whether the company converts profits into cash.'],
  ['Sector tailwinds', 'A good stock becomes stronger when its whole sector is benefiting from demand, policy support, or improving sentiment.'],
  ['Valuation discipline', 'Even strong companies can become risky if bought at overheated prices. Compare valuation with growth expectations.'],
  ['Market structure', 'Observe trend, momentum, support, resistance, and delivery/volume behavior before chasing a move.'],
  ['Upcoming triggers', 'Earnings, dividends, results, regulation, and management commentary can all change short-term stock behavior.']
];

const tradingTerms = [
  ['CNC', 'Cash and carry, usually used when you want to take delivery and move the stock into holdings.'],
  ['MIS', 'Margin intraday square-off, designed for intraday trades that appear under positions.'],
  ['NRML', 'Normal product type, commonly used for carry-forward style exposure depending on the instrument.'],
  ['LTP', 'Last traded price, the most recent transaction price visible in the market.'],
  ['Stop-loss', 'A predefined exit used to limit downside when the market moves against your view.'],
  ['Risk-reward', 'The amount you are risking compared with the amount you expect to make on the trade.']
];

const checklist = [
  'Trade only when you can explain the setup in one or two sentences.',
  'Avoid random entries in the middle of a volatile move.',
  'Do not increase quantity just because the previous trade was profitable.',
  'A small planned loss is normal; an unmanaged loss is the real problem.',
  'Focus on consistency of process before consistency of profit.'
];

function Learn() {
  return (
    <div className="page-stack">
      <section className="page-hero learn-hero">
        <div>
          <span className="section-label">Market Learning Hub</span>
          <h2 className="page-heading">Learn how traders study stocks before they place capital at risk</h2>
          <p className="page-subtitle">
            Use this section to understand stock selection, trend reading, risk control, and the
            core ideas that shape better trading decisions in the real market.
          </p>
        </div>
        <div className="learn-highlight">
          <strong>Core Mindset</strong>
          <p>A disciplined trader protects capital first, waits for quality setups, and treats patience as an advantage.</p>
        </div>
      </section>

      <section className="learn-grid">
        {learningTracks.map((step) => (
          <article className="panel-card learn-card" key={step.title}>
            <span className="section-label">Trading Framework</span>
            <h3>{step.title}</h3>
            <p className="page-subtitle">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="content-grid two-col">
        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-label">What To Check In A Stock</span>
              <h3>Important selection factors</h3>
            </div>
          </div>

          <div className="learn-term-list">
            {factorCards.map(([label, description]) => (
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
              <span className="section-label">Essential Terms</span>
              <h3>Words every beginner should know</h3>
            </div>
          </div>

          <div className="learn-term-list">
            {tradingTerms.map(([label, description]) => (
              <div className="comparison-row learn-term-row" key={label}>
                <strong>{label}</strong>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-label">Beginner Checklist</span>
            <h3>Questions to ask before entering a trade</h3>
          </div>
        </div>

        <div className="learn-checklist">
          {checklist.map((item) => (
            <div className="learn-check-item" key={item}>
              <span className="learn-check-badge">Check</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Learn;
