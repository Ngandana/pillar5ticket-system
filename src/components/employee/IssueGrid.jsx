/**
 * components/employee/IssueGrid.jsx
 * Step 1 of the submission form — category card grid + sub-category pills.
 */
import { ISSUE_CATALOGUE } from '../../lib/constants';

export default function IssueGrid({ selected, subCategory, onSelect, onSubSelect, onNext }) {
  return (
    <div className="issue-grid-wrapper">
      <div>
        <h2 className="section-title">What do you need help with?</h2>
        <p className="section-sub">Select the category that best describes your issue.</p>
      </div>

      {/* Category cards */}
      <div className="issue-grid">
        {ISSUE_CATALOGUE.map(issue => {
          const active = selected?.id === issue.id;
          return (
            <button
              key={issue.id}
              onClick={() => { onSelect(issue); onSubSelect(''); }}
              className={`issue-card ${active ? 'issue-card--active' : ''}`}
              style={{ '--card-color': issue.color, '--card-bg': issue.bg }}
            >
              <span className="issue-emoji">{issue.emoji}</span>
              <span className="issue-title">{issue.title}</span>
              <span
                className="issue-priority"
                style={{
                  background: issue.priority === 'High' ? '#fee2e2' : issue.priority === 'Medium' ? '#fef9c3' : '#f1f5f9',
                  color:      issue.priority === 'High' ? '#991b1b' : issue.priority === 'Medium' ? '#713f12' : '#475569',
                }}
              >
                {issue.priority}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-category picker */}
      {selected && (
        <div className="sub-panel">
          <p className="sub-panel-label">Select the specific issue for <strong>{selected.title}</strong>:</p>
          <div className="sub-pills">
            {selected.sub.map(s => (
              <button
                key={s}
                onClick={() => onSubSelect(s)}
                className={`sub-pill ${subCategory === s ? 'sub-pill--active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            className="btn-next"
            onClick={onNext}
            disabled={!subCategory}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
