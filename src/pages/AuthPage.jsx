/**
 * pages/AuthPage.jsx
 * Login / Register screen. Shown when user is not authenticated.
 */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import Spinner from '../components/shared/Spinner';

export default function AuthPage({ onSuccess }) {
  const [mode,     setMode]     = useState('login');   // 'login' | 'register'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const switchMode = (m) => { setMode(m); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password };
      const data = await api.post(`/auth/${mode}`, body);
      onSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-wrap">
          <div className="auth-logo">P5</div>
          <h1 className="auth-heading">Pillar 5 Group</h1>
          <p className="auth-tagline">IT Support Portal</p>
        </div>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button
            onClick={() => switchMode('login')}
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label>Company Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@pillar5.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field auth-field--pw">
            <label>Password</label>
            <div className="pw-wrapper">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="pw-toggle">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? <Spinner size={16} /> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Hint */}
        <p className="auth-hint">
          Default admin: <code>s.ngandana@pillar5group.co.za</code> / <code>Admin@Pillar5!</code>
        </p>
      </div>
    </div>
  );
}
