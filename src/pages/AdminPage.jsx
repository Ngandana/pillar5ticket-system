/**
 * pages/AdminPage.jsx
 * Full admin dashboard: KPI bar + ticket queue + ticket detail panel.
 */
import { useState, useEffect, useCallback } from 'react';
import KpiBar       from '../components/admin/KpiBar';
import TicketQueue  from '../components/admin/TicketQueue';
import TicketDetail from '../components/admin/TicketDetail';
import { api } from '../lib/api';

export default function AdminPage({ user }) {
  const [tickets,  setTickets]  = useState([]);
  const [stats,    setStats]    = useState({});
  const [techs,    setTechs]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, s, tc] = await Promise.all([
        api.get('/admin/tickets'),
        api.get('/admin/stats'),
        api.get('/admin/techs'),
      ]);
      // Guard: ensure we always set arrays, never error objects
      setTickets(Array.isArray(t)  ? t  : []);
      setStats(s && typeof s === 'object' ? s : {});
      setTechs(Array.isArray(tc) ? tc : []);
    } catch (err) {
      console.error('[AdminPage]', err);
      setError(err.message || 'Failed to load data. Check your connection.');
      setTickets([]);
      setTechs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSelect = (ticket) => setSelected(ticket);

  const handleTicketUpdate = (updatedTicket) => {
    setSelected(updatedTicket);
    setTickets(prev =>
      prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t)
    );
    api.get('/admin/stats').then(s => {
      if (s && typeof s === 'object') setStats(s);
    }).catch(() => {});
  };

  const handleExport = async () => {
    try {
      const res  = await api.get('/admin/export');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `pillar5-audit-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Export]', err);
      alert('Export failed: ' + err.message);
    }
  };

  return (
    <div className="admin-page">
      {error && (
        <div className="admin-error">
          ⚠️ {error}
          <button onClick={fetchAll} className="admin-error-retry">Retry</button>
        </div>
      )}

      <KpiBar stats={stats} />

      <div className="admin-grid">
        <TicketQueue
          tickets={tickets}
          selectedId={selected?.id}
          onSelect={handleSelect}
          onRefresh={fetchAll}
          onExport={handleExport}
          loading={loading}
          user={user}
        />
        <TicketDetail
          ticket={selected}
          user={user}
          techs={techs}
          onTicketUpdate={handleTicketUpdate}
        />
      </div>
    </div>
  );
}
