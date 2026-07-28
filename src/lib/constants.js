/**
 * lib/constants.js
 * Shared data: issue catalogue and office locations.
 */

export const ISSUE_CATALOGUE = [
  {
    id: 'network',
    title: 'No Internet',
    emoji: '🌐',
    color: '#101d3d',
    bg: '#eef1f7',
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
    color: '#c9932e',
    bg: '#fbf3e4',
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
    color: '#8a6d1f',
    bg: '#fbf3e4',
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
    color: '#101d3d',
    bg: '#eef1f7',
    priority: 'High',
    sub: [
      'Monitor not displaying anything',
      'Keyboard or mouse not working',
      'PC making unusual sounds',
      'Computer will not power on',
      'USB port not recognised',
    ],
  },
  // COMMENTED OUT: Printer Issue
  // {
  //   id: 'printer',
  //   title: 'Printer Issue',
  //   emoji: '🖨️',
  //   color: '#3b82f6',
  //   bg: '#eff6ff',
  //   priority: 'Medium',
  //   sub: [
  //     'Paper jam',
  //     'Out of toner or ink',
  //     'Printer not found on network',
  //     'Poor print quality / streaks',
  //     'Printer showing as offline',
  //   ],
  // },
  {
    id: 'other',
    title: 'Other Issue',
    emoji: '❓',
    color: '#6b7690',
    bg: '#f4f6fb',
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
  'Call Center': [
    'CC-Desk-01', 'CC-Desk-02', 'CC-Desk-03',
    'CC-Desk-04', 'CC-Desk-05', 'CC-Desk-06',
    'CC-Manager-Desk',
  ],
};

export const PRIORITY_COLORS = {
  Critical: { bg: '#3a2c14', text: '#fff' },
  High:     { bg: '#f3e2bc', text: '#7a5c17' },
  Medium:   { bg: '#eef1f7', text: '#101d3d' },
  Low:      { bg: '#eef1f7', text: '#6b7690' },
};

export const STATUS_COLORS = {
  'Open':            { bg: '#eef1f7', text: '#101d3d' },
  'In Progress':     { bg: '#f3e2bc', text: '#7a5c17' },
  'Waiting on User': { bg: '#eef1f7', text: '#6b7690' },
  'Resolved':        { bg: '#101d3d', text: '#fff' },
  'Withdrawn':       { bg: '#eef1f7', text: '#a2acc4' },
};
