import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  const [form, setForm] = useState({
    name: '',
    email: '',
    pan: '',
    password: '',
    confirmPassword: '',
    agree: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => {
    const value = form.password;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) return { label: 'Weak', className: 'strength-weak', width: '33%' };
    if (score === 2) return { label: 'Medium', className: 'strength-medium', width: '66%' };
    return { label: 'Strong', className: 'strength-strong', width: '100%' };
  }, [form.password]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!panPattern.test(form.pan)) {
      setError('Enter a valid PAN number in the format ABCDE1234F');
      return;
    }

    if (!form.agree) {
      setError('Please accept the terms to continue');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await register({
        name: form.name,
        email: form.email,
        pan: form.pan,
        password: form.password
      });
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create account');
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
          <h1>Start with a premium trading workspace.</h1>
          <p>
            Create your account to access watchlists, holdings, funds, analytics, and admin-aware
            workflows across the platform.
          </p>
        </div>
      </section>

      <section className="auth-panel light-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <span className="section-label">Create account</span>
          <h2>Open your trading profile</h2>

          <label>
            Full Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Enter your full name"
            />
          </label>

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
            PAN Number
            <input
              type="text"
              value={form.pan}
              onChange={(event) =>
                setForm((current) => ({ ...current, pan: event.target.value.toUpperCase() }))
              }
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Create a secure password"
            />
          </label>

          <div className="strength-meter">
            <div className="strength-track">
              <div className={`strength-fill ${strength.className}`} style={{ width: strength.width }} />
            </div>
            <span>{strength.label}</span>
          </div>

          <label>
            Confirm Password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              placeholder="Re-enter your password"
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(event) => setForm((current) => ({ ...current, agree: event.target.checked }))}
            />
            <span>I agree to the platform terms and risk disclosures.</span>
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button className="button button-primary full-width" type="submit" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Register'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Register;
