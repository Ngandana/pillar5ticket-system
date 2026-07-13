/**
 * pages/ForgotPasswordPage.jsx
 * Request password reset email
 */
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { api } from '../lib/api';
import Spinner from '../components/shared/Spinner';

export default function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card">
        <div className="forgot-password-box">
          {submitted ? (
            <>
              <div className="check-email-icon">📧</div>
              <h2>Check Your Email</h2>
              <p>
                If an account exists with <strong>{email}</strong>, you'll receive 
                password reset instructions within the next few minutes.
              </p>
              <p className="check-email-hint">
                Check your spam/junk folder if you don't see it.
              </p>
              <button onClick={onBack} className="btn-back-login">
                Back to Login
              </button>
            </>
          ) : (
            <>
              <button onClick={onBack} className="btn-forgot-back">
                <ChevronLeft size={18} />
                Back to Login
              </button>

              <h2>Reset Your Password</h2>
              <p>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={submit} className="auth-form">
                <div className="auth-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@pillar5group.co.za"
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-submit">
                  {loading ? <Spinner size={16} /> : null}
                  Send Reset Link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
