/**
 * pages/AuthPage.jsx
 * Login / Register with role selection, logo, and forgot password
 */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import Spinner from '../components/shared/Spinner';

export default function AuthPage({ onSuccess, onForgotPassword }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('EMPLOYEE');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (m) => { 
    setMode(m); 
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await api.post('/auth/register', { name, email, password, role });
        const loginData = await api.post('/auth/login', { email, password });
        onSuccess(loginData.user, loginData.token);
      } else {
        const data = await api.post('/auth/login', { email, password });
        onSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card">
        <div className="auth-logo-wrap">
          {/* LOGO: Will display your company logo if public/logo.png exists */}
          <img 
            src="/logo.png" 
            alt="Company Logo" 
            className="auth-logo-img"
            onError={(e) => {
              // Fallback to text if logo doesn't exist
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML += '<div class="auth-logo">P5</div>';
            }}
          />
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

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <>
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

              {/* Role Selector */}
              <div className="auth-field">
                <label>I am a...</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-option ${role === 'EMPLOYEE' ? 'role-option--active' : ''}`}
                    onClick={() => setRole('EMPLOYEE')}
                  >
                    <span className="role-emoji">👤</span>
                    <span className="role-name">Employee</span>
                    <span className="role-desc">Submit tickets</span>
                  </button>
                  <button
                    type="button"
                    className={`role-option ${role === 'TECH_ADMIN' ? 'role-option--active' : ''}`}
                    onClick={() => setRole('TECH_ADMIN')}
                  >
                    <span className="role-emoji">🔧</span>
                    <span className="role-name">IT Support</span>
                    <span className="role-desc">Manage tickets</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Company Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@pillar5group.co.za"
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
            {mode === 'login' && (
              <button type="button" onClick={onForgotPassword} className="auth-forgot-link">
                Forgot password?
              </button>
            )}
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? <Spinner size={16} /> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="auth-hint">
            Default super admin: <code>s.ngandana@pillar5group.co.za</code> / <code>Admin@Pillar5!</code>
          </p>
        )}
      </div>
    </div>
  );
}
