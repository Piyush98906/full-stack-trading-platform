const learningTracks = [
  {
    title: '1. Start with market structure',
    body: 'Before taking any trade, decide whether the stock is trending up, trending down, or moving in a range. Beginners usually make better decisions when they stop forcing trades in unclear conditions.'
  },
  {
    title: '2. Mark support and resistance',
    body: 'Support is a price zone where buying interest often shows up, while resistance is where supply can slow the move. These levels help you choose entry, stop-loss, and target areas with logic.'
  },
  {
    title: '3. Read price with volume',
    body: 'A breakout with strong volume is generally healthier than a breakout on weak participation. Volume helps confirm whether large market participants are actually supporting the move.'
  },
  {
    title: '4. Respect trend and timeframe',
    body: 'A stock can be bullish on a daily chart and weak on a five-minute chart at the same time. Always know which timeframe your trade idea belongs to before entering.'
  },
  {
    title: '5. Plan risk before reward',
    body: 'Good traders decide their stop-loss, quantity, and maximum acceptable loss before they think about profit. Capital protection is what keeps you consistent long enough to improve.'
  },
  {
    title: '6. Review every trade',
    body: 'Winning trades can still be poor decisions, and losing trades can still be disciplined. Reviewing your process helps you improve faster than only looking at P&L.'
  }
];

const factorCards = [
  ['Business quality', 'Prefer companies with understandable business models, strong market position, decent governance, and execution consistency.'],
  ['Revenue and profit growth', 'Look for businesses that are able to grow sales and profits without depending only on short-term excitement or one-off events.'],
  ['Debt and cash flow', 'High debt can increase risk when business slows down. Healthy operating cash flow gives a company more resilience.'],
  ['Return ratios', 'ROE and ROCE help you understand how efficiently the company uses capital to generate profits.'],
  ['Valuation', 'A great company bought at a very expensive level can still become a poor trade. Compare price with earnings, growth, and sector expectations.'],
  ['Sector strength', 'Stocks become stronger when their entire sector is benefiting from policy support, demand growth, or improving sentiment.'],
  ['Management and news flow', 'Promoter quality, commentary, governance, and corporate actions often affect conviction and price behavior.'],
  ['Technical setup', 'Trend, consolidation, breakout zones, moving averages, and delivery/volume patterns help refine actual timing.']
];

const tradingStyles = [
  ['Intraday trading', 'Trades opened and closed within the same session. Speed, discipline, and stop-loss execution matter a lot here.'],
  ['Swing trading', 'Trades held for a few days to a few weeks to capture a broader move after a setup forms.'],
  ['Positional trading', 'A longer holding period based on bigger trends, business conviction, or macro themes.'],
  ['Investing', 'Focuses more on business quality, earnings growth, and long-term compounding rather than short-term price noise.']
];

const tradingTerms = [
  ['CNC', 'Cash and carry. Commonly used when you want to take delivery and move the stock into holdings.'],
  ['MIS', 'Margin intraday square-off. Designed for intraday positions that are tracked in the positions section.'],
  ['NRML', 'Normal product type. Used for carry-forward style exposure depending on the instrument and setup.'],
  ['LTP', 'Last traded price, which is the latest transaction price available in the market.'],
  ['Stop-loss', 'A predefined exit level used to limit downside when the trade goes against your view.'],
  ['Risk-reward', 'The amount you are risking compared with the amount you aim to make if the trade works.'],
  ['Breakout', 'When price moves above resistance or below support with intent, often supported by stronger volume.'],
  ['Pullback', 'A temporary move against the main trend that can offer a more favorable entry if the trend stays intact.']
];

const beginnerChecklist = [
  'Can I explain this trade setup clearly in one or two sentences?',
  'Do I know the exact stop-loss level before entering?',
  'Am I taking this trade because of a setup, or because of fear of missing out?',
  'Is the quantity small enough that one loss will not disturb me emotionally?',
  'Does the sector support the stock, or is the stock moving against weak sector conditions?',
  'Have I checked whether an earnings result, event, or news item is approaching?'
];

const mistakesToAvoid = [
  'Buying a stock only because it is already running fast without checking structure.',
  'Averaging down emotionally instead of exiting a broken trade setup.',
  'Taking oversized quantity after one or two winning trades.',
  'Ignoring volume and entering weak breakouts that have little participation.',
  'Confusing investing logic with intraday execution and mixing timeframes.',
  'Moving stop-loss farther away just to avoid accepting a small planned loss.'
];

function Learn() {
  return (
    <div className="page-stack">
      <section className="page-hero learn-hero academy-hero">
        <div className="academy-hero-copy">
          <span className="section-label">Trade Academy</span>
          <h2 className="page-heading">Build market understanding before you build positions</h2>
          <p className="page-subtitle">
            This section focuses on real stock-market learning: how traders study price, volume,
            company quality, risk, and timing before placing capital at risk in the market.
          </p>
        </div>
        <div className="learn-highlight academy-highlight">
          <strong>Best Beginner Habit</strong>
          <p>Wait for clarity, size modestly, and treat risk control as your first job in every trade.</p>
        </div>
      </section>

      <section className="learn-grid learn-grid-strong">
        {learningTracks.map((step) => (
          <article className="panel-card learn-card learn-card-strong" key={step.title}>
            <span className="section-label">Trading Framework</span>
            <h3>{step.title}</h3>
            <p className="page-subtitle">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="content-grid two-col">
        <article className="panel-card learn-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Stock Selection</span>
              <h3>What to check before picking a stock</h3>
            </div>
          </div>

          <div className="learn-term-list learn-dense-list">
            {factorCards.map(([label, description]) => (
              <div className="comparison-row learn-term-row learn-term-row-strong" key={label}>
                <strong>{label}</strong>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card learn-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Trading Styles</span>
              <h3>Different ways traders approach the market</h3>
            </div>
          </div>

          <div className="learn-term-list learn-dense-list">
            {tradingStyles.map(([label, description]) => (
              <div className="comparison-row learn-term-row learn-term-row-strong" key={label}>
                <strong>{label}</strong>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid two-col">
        <article className="panel-card learn-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Trading Vocabulary</span>
              <h3>Important market terms every beginner should know</h3>
            </div>
          </div>

          <div className="learn-term-list learn-dense-list">
            {tradingTerms.map(([label, description]) => (
              <div className="comparison-row learn-term-row learn-term-row-strong" key={label}>
                <strong>{label}</strong>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card learn-panel">
          <div className="panel-head">
            <div>
              <span className="section-label">Mistakes To Avoid</span>
              <h3>Behavior that usually hurts new traders</h3>
            </div>
          </div>

          <div className="learn-checklist">
            {mistakesToAvoid.map((item) => (
              <div className="learn-check-item learn-check-item-strong" key={item}>
                <span className="learn-check-badge">Avoid</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-card learn-panel">
        <div className="panel-head">
          <div>
            <span className="section-label">Pre-Trade Checklist</span>
            <h3>Questions to ask yourself before entering a trade</h3>
          </div>
        </div>

        <div className="learn-checklist learn-checklist-wide">
          {beginnerChecklist.map((item) => (
            <div className="learn-check-item learn-check-item-strong" key={item}>
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
