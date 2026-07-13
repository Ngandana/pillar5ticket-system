/**
 * pages/ResetPasswordPage.jsx
 * Set new password via reset token
 */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import Spinner from '../components/shared/Spinner';

export default function ResetPasswordPage({ token, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(err.message || 'Reset failed. Token may have expired.');
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
          {success ? (
            <>
              <div className="check-email-icon">✅</div>
              <h2>Password Reset!</h2>
              <p>Your password has been successfully reset.</p>
              <p>Redirecting to login...</p>
            </>
          ) : (
            <>
              <h2>Set New Password</h2>
              <p>Enter your new password below.</p>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={submit} className="auth-form">
                <div className="auth-field auth-field--pw">
                  <label>New Password</label>
                  <div className="pw-wrapper">
                    <input
                      type={showPw1 ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPw1(v => !v)} className="pw-toggle">
                      {showPw1 ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field auth-field--pw">
                  <label>Confirm Password</label>
                  <div className="pw-wrapper">
                    <input
                      type={showPw2 ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw2(v => !v)} className="pw-toggle">
                      {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit">
                  {loading ? <Spinner size={16} /> : null}
                  Reset Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
