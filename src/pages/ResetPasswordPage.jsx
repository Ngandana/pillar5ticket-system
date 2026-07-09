/**
 * pages/ResetPasswordPage.jsx
 * Reset password with token from email link
 */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import Spinner from '../components/shared/Spinner';

export default function ResetPasswordPage({ token, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />

        <div className="auth-card">
          <div className="check-email-box">
            <div className="verify-icon verify-icon--success">✓</div>
            <h2>Password Reset!</h2>
            <p className="check-email-desc">
              Your password has been reset successfully.
            </p>
            <p className="check-email-hint">
              Redirecting you to login...
            </p>
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
          <h1 className="auth-heading">Reset Password</h1>
          <p className="auth-tagline">Create a new password</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field auth-field--pw">
            <label>New Password</label>
            <div className="pw-wrapper">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="pw-toggle">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="auth-field auth-field--pw">
            <label>Confirm Password</label>
            <div className="pw-wrapper">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="pw-toggle">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? <Spinner size={16} /> : null}
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
