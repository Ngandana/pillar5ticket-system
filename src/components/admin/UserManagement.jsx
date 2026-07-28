/**
 * components/admin/UserManagement.jsx
 * SUPER_ADMIN-only screen — view every account and change its role.
 */
import { useState, useEffect } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { api } from '../../lib/api';
import { fullDate } from '../../lib/utils';

const ROLES = ['EMPLOYEE', 'TECH_ADMIN', 'SUPER_ADMIN'];
const ROLE_LABEL = { EMPLOYEE: 'Employee', TECH_ADMIN: 'IT Support', SUPER_ADMIN: 'Super Admin' };

export default function UserManagement({ currentUser }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [savingId, setSavingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId, role) => {
    setSavingId(userId);
    setError('');
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="users-panel">
      <div className="users-header">
        <h2 className="users-title"><UsersIcon size={18} /> User Management</h2>
        <p className="users-sub">Promote or demote accounts. Only a super admin can change roles.</p>
      </div>

      {error && <div className="admin-error">⚠️ {error}</div>}

      {loading ? (
        <p className="content-empty">Loading users…</p>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="users-email">{u.email}</td>
                    <td className="users-date">{fullDate(u.created_at)}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={isSelf || savingId === u.id}
                        onChange={e => changeRole(u.id, e.target.value)}
                        className="ctrl-select"
                        title={isSelf ? 'You cannot change your own role.' : undefined}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                      {isSelf && <span className="users-you-tag">you</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
