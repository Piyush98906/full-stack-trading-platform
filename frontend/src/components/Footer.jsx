function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div>
          <div className="brand-mark footer-brand">
            <span className="brand-dot" />
            <span>
              Trade<span className="brand-accent">Sphere</span>
            </span>
          </div>
          <p className="footer-copy">
            Built for modern Indian investors who want execution clarity, portfolio confidence,
            and a premium trading workflow.
          </p>
        </div>

        <div className="footer-links">
          <span className="section-label">Platform</span>
          <a href="/products">Products</a>
          <a href="/pricing">Pricing</a>
          <a href="/support">Support</a>
        </div>

        <div className="footer-links">
          <span className="section-label">Regulatory</span>
          <span>SEBI Registered</span>
          <span>NSE Member</span>
          <span>BSE Member</span>
        </div>
      </div>

      <div className="site-container footer-bottom">
        <span>SEBI Registered | NSE Member | BSE Member | Investments subject to market risks</span>
        <span>Market hours: 9:15 AM - 3:30 PM IST</span>
      </div>
    </footer>
  );
}

export default Footer;
