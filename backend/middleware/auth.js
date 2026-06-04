/**
 * middleware/auth.js
 * JWT verification middleware — verifyToken (any user) and verifyAdmin.
 */
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const auth  = req.headers['authorization'];
  const token = auth && auth.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided. Please log in.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token is invalid or has expired. Please log in again.' });
    req.user = decoded;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'Admin') return next();
    res.status(403).json({ message: 'Admin access required.' });
  });
};

module.exports = { verifyToken, verifyAdmin };
