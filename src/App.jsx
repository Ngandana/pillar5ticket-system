/**
 * App.jsx — Root component
 * Auth state management + route handling
 */
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/shared/Navbar';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminPage from './pages/AdminPage';
import EmployeePage from './pages/EmployeePage';

export default function App() {
  const { user, ready, login, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // login, forgot, reset
  const location = window.location.pathname;
  
  // Extract reset password token from URL: /reset-password/:token
  const resetMatch = location.match(/^\/reset-password\/(.+)$/);
  const resetToken = resetMatch ? resetMatch[1] : null;

  if (!ready) return null;

  // Password reset page
  if (resetToken) {
    return (
      <ResetPasswordPage 
        token={resetToken}
        onSuccess={() => window.location.href = '/'}
      />
    );
  }

  // Not authenticated
  if (!user) {
    if (authMode === 'forgot') {
      return (
        <ForgotPasswordPage 
          onBack={() => setAuthMode('login')}
        />
      );
    }

    return (
      <AuthPage 
        onSuccess={login}
        onForgotPassword={() => setAuthMode('forgot')}
      />
    );
  }

  // Authenticated
  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={logout} />
      {['SUPER_ADMIN', 'TECH_ADMIN'].includes(user.role)
        ? <AdminPage user={user} />
        : <EmployeePage user={user} />}
    </div>
  );
}
