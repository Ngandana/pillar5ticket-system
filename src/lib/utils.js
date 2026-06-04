/**
 * lib/utils.js
 * Small utility helpers used across the application.
 */

/** Human-readable relative time (e.g. "3h ago", "just now") */
export function relativeTime(timestamp) {
  const diff = (Date.now() - new Date(timestamp)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Full locale date + time string */
export function fullDate(timestamp) {
  return new Date(timestamp).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Resolve image URL (handle both absolute and relative paths) */
export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${base}${path}`;
}
