/**
 * fix-admin.js (PostgreSQL version)
 * Run this once if you can't log in as admin, or if your admin account
 * ended up with the wrong role:
 *   DEFAULT_ADMIN_EMAIL=you@pillar5group.co.za DEFAULT_ADMIN_PASSWORD=NewStrongPassword node fix-admin.js
 *
 * It resets that account's password to DEFAULT_ADMIN_PASSWORD and forces the role to SUPER_ADMIN.
 * (Reads from backend/.env too, so you can set these there instead of inline.)
 */
require('dotenv').config();
const { Client }  = require('pg');
const bcrypt = require('bcrypt');

(async () => {
  const email    = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD (env or backend/.env) before running this script.');
    process.exit(1);
  }

  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'pillar5_tickets',
  });

  try {
    await client.connect();

    const hash = await bcrypt.hash(password, 12);

    // Check if admin exists
    const result = await client.query('SELECT id, role FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      await client.query(
        "UPDATE users SET password = $1, role = 'SUPER_ADMIN', email_verified = TRUE WHERE email = $2",
        [hash, email]
      );
      console.log(`✅ Password reset for ${email}`);
      console.log('✅ Admin role forced to: SUPER_ADMIN');
      if (result.rows[0].role !== 'SUPER_ADMIN') {
        console.log(`⚠️  Note: role was previously "${result.rows[0].role}" — this is likely why you were routed to the employee dashboard. It's fixed now.`);
      }
    } else {
      await client.query(
        "INSERT INTO users (name, email, password, role, email_verified, verified_at) VALUES ($1, $2, $3, 'SUPER_ADMIN', TRUE, CURRENT_TIMESTAMP)",
        ['System Admin', email, hash]
      );
      console.log(`✅ Admin account created for ${email}`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
})();
