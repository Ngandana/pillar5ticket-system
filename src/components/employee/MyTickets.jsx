/**
 * components/employee/MyTickets.jsx
 * Right sidebar — the employee's own ticket list, clickable to open chat.
 */
import { StatusBadge } from '../shared/Badge';
import { relativeTime } from '../../lib/utils';

export default function MyTickets({ tickets, selectedId, onSelect }) {
  return (
    <aside className="my-tickets">
      <div className="my-tickets-header">
        <h3 className="my-tickets-title">My Requests</h3>
        <span className="my-tickets-count">{tickets.length}</span>
      </div>

      <div className="my-tickets-list">
        {tickets.length === 0 ? (
          <p className="my-tickets-empty">You haven't submitted any tickets yet.</p>
        ) : (
          tickets.map(t => (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              className={`my-ticket-item ${selectedId === t.id ? 'my-ticket-item--active' : ''}`}
            >
              <div className="my-ticket-row">
                <span className="my-ticket-ref">{t.ticket_ref}</span>
                <StatusBadge status={t.status} />
              </div>
              <p className="my-ticket-title">{t.category}</p>
              {t.sub_category && <p className="my-ticket-sub">{t.sub_category}</p>}
              <p className="my-ticket-meta">
                📍 {t.location_zone} · {relativeTime(t.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
