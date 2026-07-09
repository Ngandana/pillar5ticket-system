/**
 * db/init.js
 * PostgreSQL connection pool + database bootstrap
 * Includes email verification tables and tiered admin roles
 */
const { Pool } = require('pg');
const bcrypt   = require('bcrypt');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'pillar5_tickets',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Pool error:', err);
  process.exit(-1);
});

async function initDB() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create enums
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'TECH_ADMIN', 'EMPLOYEE');
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
          CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
          CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Waiting on User', 'Resolved', 'Withdrawn');
        END IF;
      END $$;
    `);

    // Users (with email verification)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(100) NOT NULL,
        email           VARCHAR(100) UNIQUE NOT NULL,
        password        VARCHAR(255) NOT NULL,
        role            user_role DEFAULT 'EMPLOYEE',
        email_verified  BOOLEAN DEFAULT FALSE,
        verified_at     TIMESTAMP,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Verification tokens
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at    TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tickets
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id            SERIAL PRIMARY KEY,
        ticket_ref    VARCHAR(30) UNIQUE NOT NULL,
        user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_to   INT REFERENCES users(id) ON DELETE SET NULL,
        category      VARCHAR(100) NOT NULL,
        sub_category  VARCHAR(150),
        location_zone VARCHAR(100) NOT NULL DEFAULT 'Unknown',
        desk_number   VARCHAR(50),
        desktop_id    VARCHAR(50),
        details       TEXT,
        priority      ticket_priority DEFAULT 'Medium',
        status        ticket_status DEFAULT 'Open',
        is_withdrawn  BOOLEAN DEFAULT FALSE,
        image_url     VARCHAR(500),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id          SERIAL PRIMARY KEY,
        ticket_id   INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content     TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Activity logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id         SERIAL PRIMARY KEY,
        ticket_id  INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_name  VARCHAR(100) NOT NULL,
        action     TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default super admin (pre-verified)
    const adminCheck = await client.query(
      "SELECT id FROM users WHERE email = 's.ngandana@pillar5group.co.za'"
    );

    if (adminCheck.rows.length === 0) {
      const hash = await bcrypt.hash('Admin@Pillar5!', 12);
      await client.query(
        `INSERT INTO users (name, email, password, role, email_verified, verified_at)
         VALUES ($1, $2, $3, 'SUPER_ADMIN', TRUE, CURRENT_TIMESTAMP)`,
        ['System Admin', 's.ngandana@pillar5group.co.za', hash]
      );
      console.log('✅ SUPER_ADMIN seeded → s.ngandana@pillar5group.co.za / Admin@Pillar5!');
    }

    console.log('✅ Database ready (with email verification & tiered roles)');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
    throw err;
  } finally {
    if (client) client.release();
  }
}

module.exports = { pool, initDB };
