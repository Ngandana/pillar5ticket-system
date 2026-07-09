/**
 * pages/VerifyEmailPage.jsx
 * Email verification confirmation page
 * User is redirected here after clicking verification link
 */
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Spinner from '../components/shared/Spinner';

export default function VerifyEmailPage({ token, onVerified }) {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const data = await api.get(`/auth/verify/${token}`);
      setStatus('success');
      setMessage(data.message || 'Email verified! Redirecting to login...');
      setTimeout(() => {
        onVerified();
      }, 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-card">
        {status === 'verifying' && (
          <>
            <Spinner size={48} />
            <h2>Verifying your email...</h2>
            <p className="verify-sub">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-icon verify-icon--success">✓</div>
            <h2>Email Verified!</h2>
            <p className="verify-message">{message}</p>
            <p className="verify-sub">Redirecting you to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-icon verify-icon--error">✕</div>
            <h2>Verification Failed</h2>
            <p className="verify-message">{message}</p>
            <button onClick={() => window.location.href = '/'} className="verify-btn">
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
