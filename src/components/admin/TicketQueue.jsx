/**
 * components/admin/TicketQueue.jsx
 * Left panel — searchable, filterable, sortable list of all active tickets.
 */
import { useState } from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../shared/Badge';
import { relativeTime } from '../../lib/utils';

const PRIORITY_WEIGHT = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export default function TicketQueue({ tickets, selectedId, onSelect, onRefresh, onExport, loading, user }) {
  const canExport = user?.role === 'SUPER_ADMIN';
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy,   setSortBy]   = useState('Priority');

  const processed = tickets
    .filter(t => {
      if (status   !== 'All' && t.status   !== status)   return false;
      if (priority !== 'All' && t.priority !== priority) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.ticket_ref.toLowerCase().includes(q)     ||
          t.category.toLowerCase().includes(q)        ||
          (t.requester_name || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Priority')
        return (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
      if (sortBy === 'Newest')
        return new Date(b.created_at) - new Date(a.created_at);
      return new Date(a.created_at) - new Date(b.created_at);
    });

  return (
    <aside className="queue-panel">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-header-top">
          <h2 className="queue-title">Triage Queue</h2>
          <div className="queue-actions">
            <button className="icon-btn" onClick={onRefresh} title="Refresh" disabled={loading}>
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
            </button>
            {canExport && (
              <button className="icon-btn icon-btn--label" onClick={onExport} title="Export CSV">
                <Download size={13} /> CSV
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="search-box">
          <Search size={13} className="search-icon" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="search-input"
          />
        </div>

        {/* Filter row */}
        <div className="filter-row">
          <select value={status}   onChange={e => setStatus(e.target.value)}   className="filter-select">
            {['All','Open','In Progress','Waiting on User','Resolved'].map(s =>
              <option key={s}>{s}</option>)}
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="filter-select">
            {['All','Critical','High','Medium','Low'].map(p =>
              <option key={p}>{p}</option>)}
          </select>
          <select value={sortBy}   onChange={e => setSortBy(e.target.value)}   className="filter-select">
            {['Priority','Newest','Oldest'].map(s =>
              <option key={s}>{s}</option>)}
          </select>
        </div>

        <p className="queue-count">{processed.length} ticket{processed.length !== 1 ? 's' : ''}</p>
      </div>

      {/* List */}
      <div className="queue-list">
        {loading ? (
          <p className="queue-empty">Loading…</p>
        ) : processed.length === 0 ? (
          <p className="queue-empty">No tickets match your filters.</p>
        ) : (
          processed.map(t => {
            const active = selectedId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelect(t)}
                className={`queue-item ${active ? 'queue-item--active' : ''}`}
              >
                <div className="queue-item-row">
                  <span className="queue-item-ref">{t.ticket_ref}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <p className="queue-item-title">{t.category}</p>
                {t.sub_category && (
                  <p className="queue-item-sub">{t.sub_category}</p>
                )}
                <div className="queue-item-row queue-item-footer">
                  <span className="queue-item-user">👤 {t.requester_name}</span>
                  <StatusBadge status={t.status} />
                </div>
                {t.location_zone && (
                  <p className="queue-item-location">
                    📍 {t.location_zone}{t.desk_number ? ` · ${t.desk_number}` : ''}
                    {t.desktop_id ? ` (${t.desktop_id})` : ''}
                  </p>
                )}
                <p className="queue-item-time">{relativeTime(t.created_at)}</p>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
