function About() {
  return (
    <div className="site-page">
      <section className="content-section page-intro">
        <div className="site-container split-section">
          <div className="split-copy">
            <span className="eyebrow">About</span>
            <h1 className="page-title">Built with the visual calm of a premium fintech SaaS product.</h1>
            <p className="page-copy">
              TradeSphere blends modern dashboard design, clear execution patterns, and Indian
              market context to create a platform that feels efficient without feeling overwhelming.
            </p>
          </div>

          <div className="comparison-card">
            <div className="comparison-row">
              <span>Design Language</span>
              <strong>Clean, airy, card-driven UI</strong>
            </div>
            <div className="comparison-row">
              <span>Technology</span>
              <strong>MERN + Vite + Chart.js</strong>
            </div>
            <div className="comparison-row">
              <span>Focus</span>
              <strong>Indian equities and investor workflows</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
