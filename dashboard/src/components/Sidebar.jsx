import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { frontendHomeUrl } from '../utils/appConfig';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'DB' },
  { label: 'Watchlist', path: '/watchlist', icon: 'WL' },
  { label: 'Holdings', path: '/holdings', icon: 'HD' },
  { label: 'Positions', path: '/positions', icon: 'PS' },
  { label: 'Orders', path: '/orders', icon: 'OR' },
  { label: 'Funds', path: '/funds', icon: 'IN' },
  { label: 'Summary', path: '/summary', icon: 'SM' },
  { label: 'Learn', path: '/learn', icon: 'ED' }
];

function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const visibleItems = isAdmin
    ? [{ label: 'Dashboard', path: '/dashboard', icon: 'DB' }]
    : navItems;

  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <a className="brand-mark" href={frontendHomeUrl} title="Open landing page">
            <span className="brand-dot" />
            <span className="brand-copy">
              Trade<span className="brand-accent">Sphere</span>
            </span>
          </a>
          <button className="icon-button mobile-only" onClick={onClose} type="button">
            X
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">{isAdmin ? 'Navigation' : 'Main Menu'}</span>
          <nav className="sidebar-nav">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
                title={item.label}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {isAdmin && (
          <div className="sidebar-section">
            <span className="sidebar-label sidebar-label-spaced">Administration</span>
            <NavLink
              to="/admin"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Admin Panel"
            >
              <span className="sidebar-icon">AD</span>
              <span>Admin Panel</span>
            </NavLink>
          </div>
        )}

      </aside>

      {open && <button className="sidebar-backdrop" onClick={onClose} type="button" />}
    </>
  );
}

export default Sidebar;
