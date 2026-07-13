/**
 * lib/roles.js
 * Normalises legacy and enum role labels into the current role set.
 */

const ROLE_ALIASES = {
  admin: 'SUPER_ADMIN',
  superadmin: 'SUPER_ADMIN',
  super_admin: 'SUPER_ADMIN',
  techadmin: 'TECH_ADMIN',
  tech_admin: 'TECH_ADMIN',
  itsupport: 'TECH_ADMIN',
  employee: 'EMPLOYEE',
};

function normalizeRole(role) {
  if (!role) return '';

  const value = String(role).trim();
  if (!value) return '';

  if (['SUPER_ADMIN', 'TECH_ADMIN', 'EMPLOYEE'].includes(value)) {
    return value;
  }

  const key = value
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  return ROLE_ALIASES[key] || value.toUpperCase();
}

function isAdminRole(role) {
  const normalized = normalizeRole(role);
  return normalized === 'SUPER_ADMIN' || normalized === 'TECH_ADMIN';
}

module.exports = {
  normalizeRole,
  isAdminRole,
};
