import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      await login(form);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in right now');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-panel dark-panel">
        <div className="auth-hero">
          <div className="brand-mark auth-brand">
            <span className="brand-dot" />
            <span>
              Trade<span className="brand-accent-light">Sphere</span>
            </span>
          </div>
          <h1>Trade India&apos;s Best Stocks</h1>
          <p>
            Fast watchlists, calm portfolio analytics, and premium order workflows built around
            the Indian markets.
          </p>

          <div className="trust-list">
            <div className="trust-card">
              <strong>Protected access</strong>
              <span>JWT-secured account flows with dedicated admin controls.</span>
            </div>
            <div className="trust-card">
              <strong>Market-first UI</strong>
              <span>Watchlists, charts, order tickets, holdings, funds, and clean portfolio views.</span>
            </div>
            <div className="trust-card">
              <strong>Built for NSE & BSE</strong>
              <span>INR formatting, MIS/CNC/NRML, and Indian market context throughout.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel light-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <span className="section-label">Welcome back</span>
          <h2>Sign in to your dashboard</h2>
          <p className="auth-copy">Sign in with your registered profile to access your dashboard.</p>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword((current) => !current)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <div className="auth-action-row">
            <button className="button button-primary full-width" type="submit" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Login'}
            </button>
          </div>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Login;
