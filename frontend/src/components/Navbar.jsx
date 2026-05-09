import { NavLink } from 'react-router-dom';
import { dashboardLoginUrl, dashboardRegisterUrl } from '../utils/appUrls';

function Navbar() {
  return (
    <header className="site-navbar">
      <div className="site-container navbar-inner">
        <NavLink to="/" className="brand-mark">
          <span className="brand-dot" />
          <span>
            Trade<span className="brand-accent">Sphere</span>
          </span>
        </NavLink>

        <nav className="site-nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/support">Support</NavLink>
        </nav>

        <div className="site-nav-actions">
          <a className="button button-ghost" href={dashboardLoginUrl}>
            Login
          </a>
          <a className="button button-primary" href={dashboardRegisterUrl}>
            Open Dashboard
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
