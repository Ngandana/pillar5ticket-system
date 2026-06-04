/**
 * db/init.js
 * PostgreSQL connection pool + database bootstrap
 * Optimized for Render with proper error handling
 */
const { Pool } = require('pg');
const bcrypt   = require('bcrypt');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'pillar5_tickets',
  // Render-friendly settings
  max: 20,                          // Max connections
  idleTimeoutMillis: 30000,         // Close idle connections after 30s
  connectionTimeoutMillis: 5000,    // Timeout if can't connect within 5s
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('✅ Pool connection established');
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
          CREATE TYPE user_role AS ENUM ('Employee', 'Admin');
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

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        role       user_role DEFAULT 'Employee',
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

    // Activity Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id         SERIAL PRIMARY KEY,
        ticket_id  INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_name  VARCHAR(100) NOT NULL,
        action     TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default admin if none exists
    const result = await client.query(
      "SELECT id FROM users WHERE email = 's.ngandana@pillar5group.co.za' LIMIT 1"
    );

    if (result.rows.length === 0) {
      const hash = await bcrypt.hash('Admin@Pillar5!', 12);
      await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'Admin')",
        ['System Admin', 's.ngandana@pillar5group.co.za', hash]
      );
      console.log('✅ Default admin seeded → s.ngandana@pillar5group.co.za / Admin@Pillar5!');
    }

    console.log('✅ All tables verified/created');
  } catch (err) {
    console.error('❌ Database initialisation error:', err.message);
    throw err;
  } finally {
    if (client) client.release();
  }
}

module.exports = { pool, initDB };
