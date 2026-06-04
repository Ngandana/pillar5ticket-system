/**
 * components/employee/TicketChat.jsx
 * Full-screen chat view when an employee has selected one of their tickets.
 */
import { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { StatusBadge } from '../shared/Badge';
import { relativeTime, fullDate, imageUrl } from '../../lib/utils';
import { api } from '../../lib/api';

export default function TicketChat({ ticket, user, onBack, onWithdraw }) {
  const [comments,   setComments]   = useState([]);
  const [newComment, setNewComment] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!ticket) return;
    api.get(`/tickets/${ticket.id}/comments`)
      .then(setComments)
      .catch(console.error);
  }, [ticket?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const send = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const c = await api.post(`/tickets/${ticket.id}/comments`, {
        content:    newComment.trim(),
        isInternal: false,
      });
      setComments(prev => [...prev, c]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this ticket?')) return;
    try {
      await api.put(`/tickets/${ticket.id}/withdraw`, {});
      onWithdraw(ticket.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-view">
      {/* Back */}
      <button onClick={onBack} className="chat-back">← Back to dashboard</button>

      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <div>
            <h2 className="chat-title">{ticket.category}</h2>
            <div className="chat-meta-row">
              <span className="chat-ref">{ticket.ticket_ref}</span>
              <StatusBadge status={ticket.status} />
            </div>
            {ticket.sub_category && <p className="chat-sub">{ticket.sub_category}</p>}
          </div>
          <button onClick={handleWithdraw} className="btn-withdraw">
            <Trash2 size={13} /> Withdraw Ticket
          </button>
        </header>

        {/* Messages */}
        <div className="chat-body">
          {/* Original report bubble */}
          <div className="chat-report">
            <p className="chat-report-label">Original Report</p>
            <p className="chat-report-text">{ticket.details || 'No additional details were provided.'}</p>
            {ticket.image_url && (
              <img
                src={imageUrl(ticket.image_url)}
                alt="Attachment"
                className="chat-report-image"
                onClick={() => window.open(imageUrl(ticket.image_url), '_blank')}
              />
            )}
          </div>

          {comments.length === 0 ? (
            <p className="chat-waiting">Waiting for a response from the IT team…</p>
          ) : (
            comments.map(c => (
              <div
                key={c.id}
                className={`chat-bubble ${c.author_role === 'Employee' ? 'chat-bubble--self' : 'chat-bubble--other'}`}
              >
                <div className="chat-bubble-header">
                  <span className="chat-bubble-author">{c.author_name}</span>
                  <span className="chat-bubble-time" title={fullDate(c.created_at)}>
                    {relativeTime(c.created_at)}
                  </span>
                </div>
                <p className="chat-bubble-text">{c.content}</p>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <footer className="chat-input-area">
          <form onSubmit={send} className="chat-form">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Reply to IT support…"
              className="chat-input"
            />
            <button type="submit" className="chat-send">Send</button>
          </form>
        </footer>
      </div>
    </div>
  );
}
