/**
 * pages/ForgotPasswordPage.jsx
 * Request password reset via email
 */
import { useState } from 'react';
import { api } from '../lib/api';
import Spinner from '../components/shared/Spinner';

export default function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />

        <div className="auth-card">
          <div className="check-email-box">
            <div className="check-email-icon">📧</div>
            <h2>Check Your Email</h2>
            <p className="check-email-desc">
              If an account exists with that email, we've sent password reset instructions.
            </p>
            <p className="check-email-hint">
              The reset link expires in 24 hours.
            </p>
            <button 
              onClick={onBack}
              className="btn-back-login"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo">P5</div>
          <h1 className="auth-heading">Forgot Password?</h1>
          <p className="auth-tagline">Enter your email to reset</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Company Email (@pillar5group.co.za)</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@pillar5group.co.za"
              autoComplete="email"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? <Spinner size={16} /> : null}
            Send Reset Link
          </button>
        </form>

        <button 
          onClick={onBack}
          className="auth-link"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
