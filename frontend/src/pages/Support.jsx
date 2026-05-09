function Support() {
  return (
    <div className="site-page">
      <section className="content-section page-intro">
        <div className="site-container support-grid">
          <div className="feature-card">
            <span className="eyebrow">Support</span>
            <h1 className="page-title">Need help getting started?</h1>
            <p className="page-copy">
              Explore the demo account, review market terminology, and use the dashboard to test
              watchlists, holdings, positions, funds, and admin controls.
            </p>
          </div>

          <div className="comparison-card">
            <div className="comparison-row">
              <span>Demo User</span>
              <strong>demo@tradingplatform.in</strong>
            </div>
            <div className="comparison-row">
              <span>Password</span>
              <strong>Demo@123</strong>
            </div>
            <div className="comparison-row">
              <span>Admin User</span>
              <strong>admin@tradingplatform.in</strong>
            </div>
            <div className="comparison-row">
              <span>Admin Password</span>
              <strong>Admin@123</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Support;
