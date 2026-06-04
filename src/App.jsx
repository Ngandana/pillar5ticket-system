/**
 * App.jsx — Root component
 * Manages auth state and renders the correct page based on role.
 */
import { useAuth }       from './hooks/useAuth';
import Navbar            from './components/shared/Navbar';
import AuthPage          from './pages/AuthPage';
import AdminPage         from './pages/AdminPage';
import EmployeePage      from './pages/EmployeePage';

export default function App() {
  const { user, ready, login, logout } = useAuth();

  // Don't flash the login screen while restoring session from localStorage
  if (!ready) return null;

  if (!user) return <AuthPage onSuccess={login} />;

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={logout} />
      {user.role === 'Admin'
        ? <AdminPage    user={user} />
        : <EmployeePage user={user} />}
    </div>
  );
}
