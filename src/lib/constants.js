/**
 * lib/constants.js
 * Shared data: issue catalogue and office locations.
 * Edit this file to add/remove categories, sub-issues, and desks.
 */

export const ISSUE_CATALOGUE = [
  {
    id: 'network',
    title: 'No Internet',
    emoji: '🌐',
    color: '#ef4444',
    bg: '#fef2f2',
    priority: 'High',
    sub: [
      'Cannot connect to Wi-Fi',
      'Internet is extremely slow',
      'Keeps disconnecting randomly',
      'Ethernet / LAN cable damaged',
      'No connectivity at all (Wi-Fi + LAN)',
    ],
  },
  {
    id: 'access',
    title: 'Password Reset',
    emoji: '🔑',
    color: '#10b981',
    bg: '#ecfdf5',
    priority: 'High',
    sub: [
      'Locked out of Windows login',
      'Email / Outlook password reset',
      'Portal or internal system access denied',
      'Two-factor authentication issue',
      'New employee account setup',
    ],
  },
  {
    id: 'software',
    title: 'Software Error',
    emoji: '🐛',
    color: '#f97316',
    bg: '#fff7ed',
    priority: 'Medium',
    sub: [
      'Application keeps crashing',
      'Software license expired',
      'Need new software installed',
      'Blue screen / BSOD error',
      'Computer is slow or frozen',
    ],
  },
  {
    id: 'hardware',
    title: 'Hardware Issue',
    emoji: '🖥️',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    priority: 'High',
    sub: [
      'Monitor not displaying anything',
      'Keyboard or mouse not working',
      'PC making unusual sounds',
      'Computer will not power on',
      'USB port not recognised',
    ],
  },
  {
    id: 'printer',
    title: 'Printer Issue',
    emoji: '🖨️',
    color: '#3b82f6',
    bg: '#eff6ff',
    priority: 'Medium',
    sub: [
      'Paper jam',
      'Out of toner or ink',
      'Printer not found on network',
      'Poor print quality / streaks',
      'Printer showing as offline',
    ],
  },
  {
    id: 'other',
    title: 'Other Issue',
    emoji: '❓',
    color: '#64748b',
    bg: '#f8fafc',
    priority: 'Low',
    sub: [
      'General IT enquiry',
      'Requesting new equipment',
      'Physical workspace problem',
      'Data backup request',
      'Something else',
    ],
  },
];

export const OFFICE_LOCATIONS = {
  'Main Office': [
    'MO-Desk-01', 'MO-Desk-02', 'MO-Desk-03',
    'MO-Desk-04', 'MO-Desk-05', 'MO-Desk-06',
    'Reception',
  ],
  'Computer Lab': [
    'Lab-Station-01', 'Lab-Station-02', 'Lab-Station-03',
    'Lab-Station-04', 'Lab-Station-05', 'Lab-Station-06',
    'Instructor Desk',
  ],
  'IT Department': [
    'IT-Desk-01', 'IT-Desk-02', 'IT-Desk-03',
    'Server Room', 'IT Storage',
  ],
};

export const PRIORITY_COLORS = {
  Critical: { bg: '#dc2626', text: '#fff' },
  High:     { bg: '#fed7aa', text: '#9a3412' },
  Medium:   { bg: '#fef9c3', text: '#854d0e' },
  Low:      { bg: '#f1f5f9', text: '#475569' },
};

export const STATUS_COLORS = {
  'Open':            { bg: '#dbeafe', text: '#1d4ed8' },
  'In Progress':     { bg: '#ede9fe', text: '#6d28d9' },
  'Waiting on User': { bg: '#fef3c7', text: '#92400e' },
  'Resolved':        { bg: '#d1fae5', text: '#065f46' },
  'Withdrawn':       { bg: '#f1f5f9', text: '#475569' },
};
