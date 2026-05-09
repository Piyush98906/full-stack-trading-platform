const pricingTiers = [
  {
    name: 'Starter',
    price: '₹0',
    note: 'For demos and exploration',
    features: ['Public site access', 'Dashboard walkthrough', 'Demo portfolio']
  },
  {
    name: 'Trader',
    price: '₹999/mo',
    note: 'For active retail traders',
    features: ['Portfolio analytics', 'Watchlist and order workflows', 'Funds and profile tools']
  },
  {
    name: 'Admin',
    price: '₹2,499/mo',
    note: 'For operators and internal teams',
    features: ['Full admin CRUD', 'System-wide order oversight', 'User and holding management']
  }
];

function Pricing() {
  return (
    <div className="site-page">
      <section className="content-section page-intro">
        <div className="site-container">
          <span className="eyebrow">Pricing</span>
          <h1 className="page-title">Simple plans designed for modern fintech rollouts.</h1>
          <div className="pricing-grid">
            {pricingTiers.map((tier) => (
              <article className="pricing-card" key={tier.name}>
                <span className="section-label">{tier.note}</span>
                <h3>{tier.name}</h3>
                <strong>{tier.price}</strong>
                <ul className="pricing-list">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Pricing;
