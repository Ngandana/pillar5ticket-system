/**
 * fix-admin.js (PostgreSQL version)
 * Run this once if you can't log in as admin:
 *   node fix-admin.js
 *
 * It updates the admin password to: Admin@Pillar5!
 */
require('dotenv').config();
const { Client }  = require('pg');
const bcrypt = require('bcrypt');

(async () => {
  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'pillar5_tickets',
  });

  try {
    await client.connect();

    const hash = await bcrypt.hash('Admin@Pillar5!', 12);

    // Check if admin exists
    const result = await client.query(
      "SELECT id FROM users WHERE email = 's.ngandana@pillar5group.co.za'"
    );

    if (result.rows.length > 0) {
      await client.query(
        "UPDATE users SET password = $1, role = 'Admin' WHERE email = 's.ngandana@pillar5group.co.za'",
        [hash]
      );
      console.log('✅ Admin password reset to: Admin@Pillar5!');
    } else {
      await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'Admin')",
        ['System Admin', 's.ngandana@pillar5group.co.za', hash]
      );
      console.log('✅ Admin account created. Password: Admin@Pillar5!');
    }
  } finally {
    await client.end();
  }
})();
