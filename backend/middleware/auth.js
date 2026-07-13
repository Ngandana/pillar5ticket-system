/**
 * middleware/auth.js
 * JWT verification with tiered role-based access
 */
const jwt = require('jsonwebtoken');
const { normalizeRole, isAdminRole } = require('../lib/roles');

const verifyToken = (req, res, next) => {
  const auth  = req.headers['authorization'];
  const token = auth && auth.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token. Please log in.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token invalid or expired.' });
    req.user = { ...decoded, role: normalizeRole(decoded.role) };
    next();
  });
};

// Only SUPER_ADMIN or TECH_ADMIN can access
const verifySuperAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (isAdminRole(req.user.role)) return next();
    res.status(403).json({ message: 'Super admin access required.' });
  });
};

// Only SUPER_ADMIN (not TECH_ADMIN)
const verifyAdminOnly = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'SUPER_ADMIN') return next();
    res.status(403).json({ message: 'System admin only feature.' });
  });
};

// TECH_ADMIN or higher
const verifyTechAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (isAdminRole(req.user.role)) return next();
    res.status(403).json({ message: 'Admin access required.' });
  });
};

module.exports = {
  verifyToken,
  verifySuperAdmin,  // Both SUPER_ADMIN and TECH_ADMIN
  verifyAdminOnly,   // Only SUPER_ADMIN
  verifyTechAdmin,   // TECH_ADMIN and higher
};
