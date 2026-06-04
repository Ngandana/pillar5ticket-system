/**
 * components/shared/Badge.jsx
 * Reusable pill badge for status and priority labels.
 */
import { PRIORITY_COLORS, STATUS_COLORS } from '../../lib/constants';

export function PriorityBadge({ priority }) {
  const c = PRIORITY_COLORS[priority] || { bg: '#f1f5f9', text: '#475569' };
  return (
    <span className="badge" style={{ background: c.bg, color: c.text }}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#f1f5f9', text: '#475569' };
  return (
    <span className="badge" style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}
