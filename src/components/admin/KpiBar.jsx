/**
 * components/admin/KpiBar.jsx
 * Five KPI metric cards shown at the top of the admin dashboard.
 */
import { TicketCheck, Clock, AlertCircle, CheckCircle, Zap } from 'lucide-react';

const CARDS = [
  { key: 'total',    label: 'Total Tickets',   Icon: TicketCheck,  accent: '#101d3d' },
  { key: 'open',     label: 'Active Issues',   Icon: Clock,        accent: '#c9932e' },
  { key: 'high',     label: 'High / Critical', Icon: AlertCircle,  accent: '#7a5c17' },
  { key: 'resolved', label: 'Resolved',        Icon: CheckCircle,  accent: '#101d3d' },
  { key: 'today',    label: 'Logged Today',    Icon: Zap,          accent: '#c9932e' },
];

export default function KpiBar({ stats }) {
  return (
    <div className="kpi-bar">
      {CARDS.map(({ key, label, Icon, accent }) => (
        <div key={key} className="kpi-card">
          <div className="kpi-icon" style={{ background: `${accent}22`, color: accent }}>
            <Icon size={20} />
          </div>
          <div>
            <p className="kpi-label">{label}</p>
            <p className="kpi-value">{stats[key] ?? '–'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
