/**
 * routes/auth.js
 * POST /api/auth/register
 * POST /api/auth/login
 */
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { pool } = require('../db/init');

const ALLOWED_DOMAINS = ['@pillar5.com', '@pillar5group.co.za'];

const makeToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

// ── Register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: 'Name, email, and password are all required.' });

    const emailLower = email.toLowerCase().trim();
    const domainOk   = ALLOWED_DOMAINS.some(d => emailLower.endsWith(d));
    if (!domainOk)
      return res.status(403).json({
        message: 'Security Policy: Only @pillar5.com or @pillar5group.co.za email addresses may register.',
      });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existsRes = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existsRes.rows.length > 0)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 12);
    const insertRes = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'Employee') RETURNING id, name, email, role",
      [name.trim(), emailLower, hashed]
    );

    const user = insertRes.rows[0];
    const token = makeToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('[Register]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const selectRes = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase().trim()]);
    if (selectRes.rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const dbUser = selectRes.rows[0];
    const valid  = await bcrypt.compare(password, dbUser.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const { password: _pw, ...user } = dbUser;
    const token = makeToken({ id: user.id, role: user.role, name: user.name });
    res.json({ token, user });
  } catch (err) {
    console.error('[Login]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
