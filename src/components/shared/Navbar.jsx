/**
 * components/shared/Navbar.jsx
 * Top navigation bar — shows logo, current user, and logout button.
 */
import { LogOut, Shield, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const isAdmin = user?.role === 'Admin';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className={`navbar-logo ${isAdmin ? 'navbar-logo--admin' : ''}`}>
            <span>P5</span>
          </div>
          <div>
            <p className="navbar-title">
              {isAdmin ? 'Tech Support Portal' : 'IT Support'}
            </p>
            <p className="navbar-subtitle">Pillar 5 Group</p>
          </div>
        </div>

        {/* User + logout */}
        <div className="navbar-right">
          <div className="navbar-user">
            <div className={`navbar-user-dot ${isAdmin ? 'dot--admin' : 'dot--employee'}`} />
            {isAdmin ? <Shield size={13} /> : <User size={13} />}
            <span className="navbar-user-name">{user?.name}</span>
            <span className="navbar-role-badge">{user?.role}</span>
          </div>
          <button className="navbar-logout" onClick={onLogout} title="Sign out">
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
