const productSections = [
  {
    title: 'Trading Dashboard',
    text: 'A responsive, SaaS-style dashboard with portfolio KPIs, topbar indices, watchlist execution, and admin visibility.'
  },
  {
    title: 'Research-Led Watchlists',
    text: 'Search across Indian equities, pin names locally, inspect quotes, and launch buy or sell workflows from the same screen.'
  },
  {
    title: 'Capital Management',
    text: 'Add or withdraw funds, review transaction history, and monitor used margin versus available cash in real time.'
  }
];

function Products() {
  return (
    <div className="site-page">
      <section className="content-section page-intro">
        <div className="site-container">
          <span className="eyebrow">Products</span>
          <h1 className="page-title">A complete stack for a premium Indian trading experience.</h1>
          <p className="page-copy">
            Public marketing pages, a secure dashboard, portfolio analytics, stock discovery, and
            order workflows all live inside one cohesive system.
          </p>

          <div className="feature-grid">
            {productSections.map((item) => (
              <article className="feature-card" key={item.title}>
                <div className="feature-icon feature-icon-alt" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Products;
