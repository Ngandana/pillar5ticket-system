/**
 * routes/auth.js (PostgreSQL version)
 * FIXED: Ensure role is properly returned in login response
 */
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { pool } = require('../db/init');
const {
  generateVerificationToken,
  sendPasswordResetEmail,
  verifyPasswordToken,
} = require('../services/mail');

const ALLOWED_DOMAIN = '@pillar5group.co.za';

function checkDomain(email) {
  return email.toLowerCase().trim().endsWith(ALLOWED_DOMAIN);
}

const makeJWT = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: 'Name, email, and password are required.' });

    if (!['EMPLOYEE', 'TECH_ADMIN'].includes(role))
      return res.status(400).json({ message: 'Invalid role selected.' });

    const emailLower = email.toLowerCase().trim();

    if (!checkDomain(emailLower))
      return res.status(403).json({
        message: `Only @pillar5group.co.za company email addresses are allowed to register.`,
      });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length > 0)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, email_verified, verified_at) VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
      [name.trim(), emailLower, hashed, role]
    );

    res.status(201).json({
      message: 'Account created successfully! You can now log in.',
      email: emailLower,
    });
  } catch (err) {
    console.error('[Register]', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const result = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const dbUser = result.rows[0];

    const valid = await bcrypt.compare(password, dbUser.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid email or password.' });

    // IMPORTANT: Include role in JWT token
    const token = makeJWT({ 
      id: dbUser.id, 
      role: dbUser.role,  // ← MAKE SURE ROLE IS HERE
      name: dbUser.name 
    });

    // Return user object WITH role for frontend state
    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,  // ← MAKE SURE ROLE IS HERE
    };

    res.json({ token, user });
  } catch (err) {
    console.error('[Login]', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const emailLower = email.toLowerCase().trim();
    const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [emailLower]);

    // Always return success for security (don't reveal if email exists)
    if (result.rows.length === 0) {
      return res.json({
        message: 'If an account exists with that email, you will receive password reset instructions.',
      });
    }

    const { id: userId, name: userName } = result.rows[0];
    const token = await generateVerificationToken(userId);
    const link  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    await sendPasswordResetEmail(emailLower, userName, link);

    res.json({
      message: 'If an account exists with that email, you will receive password reset instructions.',
    });
  } catch (err) {
    console.error('[ForgotPassword]', err);
    res.json({ message: 'If an account exists with that email, you will receive password reset instructions.' });
  }
});

// ── POST /api/auth/reset-password ───────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ message: 'Token and new password are required.' });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    // Verify token
    const userId = await verifyPasswordToken(token);

    // Hash new password
    const hashed = await bcrypt.hash(password, 12);

    // Update password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

    res.json({
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
