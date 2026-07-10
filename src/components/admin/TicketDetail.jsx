/**
 * components/admin/TicketDetail.jsx
 * Right panel — full ticket detail, controls, communication, and audit log.
 */
import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Activity, MessageSquare } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../shared/Badge';
import { relativeTime, fullDate, imageUrl } from '../../lib/utils';
import { api } from '../../lib/api';

const PRIORITY_RANK = { Low: 1, Medium: 2, High: 3, Critical: 4 };

export default function TicketDetail({ ticket, user, techs, onTicketUpdate }) {
  const [comments,    setComments]    = useState([]);
  const [logs,        setLogs]        = useState([]);
  const [activeTab,   setActiveTab]   = useState('comments');
  const [newComment,  setNewComment]  = useState('');
  const [isInternal,  setIsInternal]  = useState(false);
  const chatEndRef = useRef(null);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Fetch comments + logs whenever the selected ticket changes
  useEffect(() => {
    if (!ticket) return;
    setComments([]);
    setLogs([]);
    setActiveTab('comments');

    Promise.all([
      api.get(`/tickets/${ticket.id}/comments`),
      api.get(`/tickets/${ticket.id}/logs`),
    ]).then(([c, l]) => {
      setComments(c);
      setLogs(l);
    }).catch(console.error);
  }, [ticket?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleUpdate = async (field, value) => {
    const updated = { ...ticket, [field]: value };
    try {
      await api.put(`/admin/tickets/${ticket.id}`, {
        status:      updated.status,
        priority:    updated.priority,
        assigned_to: updated.assigned_to,
      });
      onTicketUpdate(updated);
      // Refresh logs
      const l = await api.get(`/tickets/${ticket.id}/logs`);
      setLogs(l);
    } catch (err) {
      console.error('[UpdateTicket]', err);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const c = await api.post(`/tickets/${ticket.id}/comments`, {
        content:    newComment.trim(),
        isInternal,
      });
      setComments(prev => [...prev, c]);
      setNewComment('');
      setIsInternal(false);
    } catch (err) {
      console.error('[PostComment]', err);
    }
  };

  if (!ticket) {
    return (
      <div className="detail-empty">
        <ShieldAlert size={52} className="detail-empty-icon" />
        <p>Select a ticket from the queue to begin triage.</p>
      </div>
    );
  }

  return (
    <section className="detail-panel">
      {/* ── Ticket header ──────────────────────────────── */}
      <header className="detail-header">
        <div className="detail-header-main">
          <div>
            <div className="detail-ref-row">
              <span className="detail-ref">{ticket.ticket_ref}</span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge   status={ticket.status} />
            </div>
            <h2 className="detail-title">{ticket.category}</h2>
            {ticket.sub_category && <p className="detail-sub">{ticket.sub_category}</p>}
            <p className="detail-meta">
              Reported by <strong>{ticket.requester_name}</strong> · {relativeTime(ticket.created_at)}
            </p>
            {ticket.location_zone && (
              <p className="detail-location">
                📍 {ticket.location_zone}
                {ticket.desk_number ? ` · ${ticket.desk_number}` : ''}
                {ticket.desktop_id  ? ` (${ticket.desktop_id})` : ''}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="detail-controls">
            <label className="ctrl-label">Status</label>
            <select
              value={ticket.status}
              onChange={e => handleUpdate('status', e.target.value)}
              className="ctrl-select ctrl-select--primary"
            >
              {['Open', 'In Progress', 'Waiting on User', 'Resolved'].map(s =>
                <option key={s}>{s}</option>)}
            </select>

            <label className="ctrl-label">Priority</label>
            <select
              value={ticket.priority}
              onChange={e => handleUpdate('priority', e.target.value)}
              className="ctrl-select"
              title={!isSuperAdmin ? 'IT Support can lower priority but only a super admin can escalate it.' : undefined}
            >
              {['Low', 'Medium', 'High', 'Critical'].map(p => (
                <option
                  key={p}
                  disabled={!isSuperAdmin && PRIORITY_RANK[p] > PRIORITY_RANK[ticket.priority]}
                >
                  {p}
                </option>
              ))}
            </select>

            <label className="ctrl-label">Assigned To</label>
            <select
              value={ticket.assigned_to || ''}
              onChange={e => handleUpdate('assigned_to', e.target.value || null)}
              className="ctrl-select"
              disabled={!isSuperAdmin}
              title={!isSuperAdmin ? 'Only a super admin can assign tickets.' : undefined}
            >
              <option value="">Unassigned</option>
              {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Original description */}
        {ticket.details && (
          <div className="detail-description">{ticket.details}</div>
        )}

        {/* Image attachment */}
        {ticket.image_url && (
          <img
            src={imageUrl(ticket.image_url)}
            alt="Attachment"
            className="detail-image"
            onClick={() => window.open(imageUrl(ticket.image_url), '_blank')}
          />
        )}
      </header>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'comments' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={14} /> Communication
        </button>
        {isSuperAdmin && (
          <button
            className={`tab-btn ${activeTab === 'logs' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Activity size={14} /> Audit Trail
          </button>
        )}
      </div>

      {/* ── Tab Content ────────────────────────────────── */}
      <div className="detail-content">
        {activeTab === 'comments' || !isSuperAdmin ? (
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="content-empty">No communication on this ticket yet.</p>
            ) : comments.map(c => (
              <div
                key={c.id}
                className={`comment ${c.is_internal ? 'comment--internal' : c.author_role === 'Admin' ? 'comment--admin' : 'comment--employee'}`}
              >
                <div className="comment-header">
                  <span className="comment-author">
                    {c.author_name}
                    {c.is_internal && <span className="internal-badge">INTERNAL</span>}
                  </span>
                  <span className="comment-time" title={fullDate(c.created_at)}>
                    {relativeTime(c.created_at)}
                  </span>
                </div>
                <p className="comment-body">{c.content}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        ) : (
          <div className="logs-list">
            {logs.length === 0 ? (
              <p className="content-empty">No activity recorded yet.</p>
            ) : logs.map(l => (
              <div key={l.id} className="log-entry">
                <div className="log-dot" />
                <div>
                  <p className="log-text">
                    <strong>{l.user_name}</strong> {l.action}
                  </p>
                  <p className="log-time">{fullDate(l.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Comment input ───────────────────────────────── */}
      {activeTab === 'comments' && (
        <footer className="detail-footer">
          <form onSubmit={postComment} className="comment-form">
            <textarea
              rows={2}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Type a reply or internal note…"
              className="comment-input"
            />
            <div className="comment-form-row">
              <label className="internal-toggle">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={e => setIsInternal(e.target.checked)}
                />
                Internal note (hidden from employee)
              </label>
              <button
                type="submit"
                className={`btn-submit ${isInternal ? 'btn-submit--internal' : ''}`}
              >
                {isInternal ? 'Post Internal Note' : 'Post Reply'}
              </button>
            </div>
          </form>
        </footer>
      )}
    </section>
  );
}
