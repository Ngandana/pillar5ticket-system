/**
 * pages/EmployeePage.jsx
 * Employee dashboard: 2-step submission form + my tickets sidebar + chat view.
 */
import { useState, useEffect, useCallback } from 'react';
import IssueGrid  from '../components/employee/IssueGrid';
import SubmitForm from '../components/employee/SubmitForm';
import MyTickets  from '../components/employee/MyTickets';
import TicketChat from '../components/employee/TicketChat';
import { api } from '../lib/api';

export default function EmployeePage({ user }) {
  const [tickets,       setTickets]       = useState([]);
  const [view,          setView]          = useState('home');
  const [step,          setStep]          = useState(1);
  const [activeTicket,  setActiveTicket]  = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [subCategory,   setSubCategory]   = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [successMsg,    setSuccessMsg]    = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      const data = await api.get('/tickets/mine');
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[FetchTickets]', err);
      setTickets([]);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await api.upload('/tickets', formData);
      await fetchTickets();
      setSelectedIssue(null);
      setSubCategory('');
      setStep(1);
      setSuccessMsg('✅ Ticket submitted! The IT team has been notified.');
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      console.error('[Submit]', err);
      alert(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openChat = (ticket) => {
    setActiveTicket(ticket);
    setView('chat');
  };

  const handleWithdraw = (ticketId) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    setView('home');
    setActiveTicket(null);
  };

  if (view === 'chat' && activeTicket) {
    return (
      <div className="employee-page">
        <TicketChat
          ticket={activeTicket}
          user={user}
          onBack={() => setView('home')}
          onWithdraw={handleWithdraw}
        />
      </div>
    );
  }

  return (
    <div className="employee-page">
      {successMsg && <div className="success-toast">{successMsg}</div>}

      <div className="employee-grid">
        <div className="employee-main">
          <div className="employee-greeting">
            <h2>Hi {user.name.split(' ')[0]} 👋</h2>
            <p>What can the IT team help you with today?</p>
          </div>

          {step === 1 ? (
            <IssueGrid
              selected={selectedIssue}
              subCategory={subCategory}
              onSelect={setSelectedIssue}
              onSubSelect={setSubCategory}
              onNext={() => setStep(2)}
            />
          ) : (
            <SubmitForm
              issue={selectedIssue}
              subCategory={subCategory}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>

        <MyTickets
          tickets={tickets}
          selectedId={activeTicket?.id}
          onSelect={openChat}
        />
      </div>
    </div>
  );
}
