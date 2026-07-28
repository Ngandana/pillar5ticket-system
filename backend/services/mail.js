/**
 * services/mail.js  v2.2
 * Nodemailer service for:
 *   - Email verification
 *   - Password reset
 * SMTP: Microsoft Outlook (smtp.office365.com)
 * Domain restriction: @pillar5group.co.za only
 */
const nodemailer = require('nodemailer');
const crypto     = require('crypto');
const { pool }   = require('../db/init');

// ── SMTP Transporter ─────────────────────────────────────────
// Configured for Microsoft Outlook / Office 365
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.office365.com',
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: false,   // STARTTLS — Office 365 always uses port 587 + STARTTLS
  auth: {
    user: process.env.SMTP_USER,    // your@pillar5group.co.za
    pass: process.env.SMTP_PASSWORD, // your Outlook password or App Password
  },
  tls: {
    ciphers: 'SSLv3',   // required for Office 365
    rejectUnauthorized: false,
  },
});

// ── Shared: Generate + store token ───────────────────────────
async function generateToken(userId, type) {
  // Invalidate any existing unused tokens of the same type
  await pool.query(
    `UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND type = $2 AND used_at IS NULL`,
    [userId, type]
  );

  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await pool.query(
    'INSERT INTO verification_tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)',
    [userId, token, type, expiresAt]
  );

  return token;
}

// ── Shared: Validate + consume token ─────────────────────────
async function consumeToken(token, expectedType) {
  const result = await pool.query(
    `SELECT user_id, expires_at FROM verification_tokens
     WHERE token = $1 AND type = $2 AND used_at IS NULL`,
    [token, expectedType]
  );

  if (result.rows.length === 0)
    throw new Error('Invalid or already-used link. Please request a new one.');

  const { user_id, expires_at } = result.rows[0];

  if (new Date() > new Date(expires_at))
    throw new Error('This link has expired (24 hours). Please request a new one.');

  await pool.query(
    'UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1',
    [token]
  );

  return user_id;
}

// ── Shared: escape user-supplied text before dropping it into HTML email ──
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Shared HTML Email wrapper ─────────────────────────────────
function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
            <div style="display:inline-block;background:#3b82f6;color:#fff;font-size:22px;font-weight:900;padding:8px 18px;border-radius:8px;letter-spacing:1px;margin-bottom:8px;">P5</div>
            <div style="color:#93c5fd;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;">Pillar 5 Group · IT Support Portal</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
              This email was sent by the Pillar 5 Group IT Support Portal.<br>
              If you didn't request this, you can safely ignore this email.<br><br>
              © Pillar 5 Group · s.ngandana@pillar5group.co.za
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Send Email ────────────────────────────────────────────────
async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Pillar 5 IT Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent → ${to} [${subject}]`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed → ${to}:`, err.message);
    return false;
  }
}

// ── Public: Email Verification ────────────────────────────────
async function generateVerificationToken(userId) {
  return generateToken(userId, 'email_verification');
}

async function sendVerificationEmail(email, userName, verificationLink) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:22px;">Verify your email address</h2>
    <p style="color:#475569;margin:0 0 8px;">Hi <strong>${userName}</strong>,</p>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">
      Welcome to the Pillar 5 Group IT Support Portal. Please verify your email
      address to activate your account.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verificationLink}"
         style="background:#3b82f6;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
        Verify Email Address
      </a>
    </div>
    <p style="color:#64748b;font-size:13px;margin:24px 0 8px;">Or paste this link in your browser:</p>
    <p style="background:#f1f5f9;padding:12px;border-radius:6px;font-size:12px;word-break:break-all;color:#475569;margin:0;">
      ${verificationLink}
    </p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
      This link expires in <strong>24 hours</strong>.
    </p>
  `);

  return sendMail(email, 'Verify your Pillar 5 IT Support Account', html);
}

async function verifyEmail(token) {
  const userId = await consumeToken(token, 'email_verification');
  await pool.query(
    'UPDATE users SET email_verified = TRUE, verified_at = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
  return userId;
}

// ── Public: Password Reset ────────────────────────────────────
async function generatePasswordResetToken(userId) {
  return generateToken(userId, 'password_reset');
}

async function sendPasswordResetEmail(email, userName, resetLink) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:22px;">Reset your password</h2>
    <p style="color:#475569;margin:0 0 8px;">Hi <strong>${userName}</strong>,</p>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetLink}"
         style="background:#dc2626;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color:#64748b;font-size:13px;margin:24px 0 8px;">Or paste this link in your browser:</p>
    <p style="background:#f1f5f9;padding:12px;border-radius:6px;font-size:12px;word-break:break-all;color:#475569;margin:0;">
      ${resetLink}
    </p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
      This link expires in <strong>24 hours</strong>. 
      If you didn't request a password reset, you can safely ignore this email — your password will not change.
    </p>
  `);

  return sendMail(email, 'Reset your Pillar 5 IT Support Password', html);
}

async function verifyPasswordToken(token) {
  return consumeToken(token, 'password_reset');
}

// ── Public: Ticket Assignment ──────────────────────────────────
async function sendTicketAssignedEmail(email, techName, ticket) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:22px;">You've been assigned a ticket</h2>
    <p style="color:#475569;margin:0 0 8px;">Hi <strong>${escapeHtml(techName)}</strong>,</p>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">
      You've been assigned ticket <strong>${escapeHtml(ticket.ticket_ref)}</strong>
      — ${escapeHtml(ticket.category)}${ticket.sub_category ? ' · ' + escapeHtml(ticket.sub_category) : ''},
      priority <strong>${escapeHtml(ticket.priority)}</strong>.
    </p>
    ${ticket.details ? `
    <p style="background:#f1f5f9;padding:12px;border-radius:6px;font-size:13px;color:#475569;margin:0 0 24px;white-space:pre-wrap;">
      ${escapeHtml(ticket.details)}
    </p>` : ''}
    <div style="text-align:center;margin:32px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}"
         style="background:#3b82f6;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
        Open Triage Queue
      </a>
    </div>
  `);

  return sendMail(email, `Ticket assigned: ${ticket.ticket_ref}`, html);
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  verifyEmail,
  generatePasswordResetToken,
  sendPasswordResetEmail,
  verifyPasswordToken,
  sendTicketAssignedEmail,
};
