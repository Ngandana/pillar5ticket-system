-- ============================================================
-- Pillar 5 Group — IT Ticketing System
-- PostgreSQL Schema (with Email Verification & Tiered Admin)
-- ============================================================

-- Create enums
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'TECH_ADMIN', 'EMPLOYEE');
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Waiting on User', 'Resolved', 'Withdrawn');

-- Users (with email verification)
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

-- Verification / password-reset tokens (distinguished by `type`)
CREATE TABLE IF NOT EXISTS verification_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) UNIQUE NOT NULL,
  type       VARCHAR(30) NOT NULL DEFAULT 'email_verification',
  expires_at TIMESTAMP NOT NULL,
  used_at    TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets
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

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id          SERIAL PRIMARY KEY,
  ticket_id   INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id         SERIAL PRIMARY KEY,
  ticket_id  INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_name  VARCHAR(100) NOT NULL,
  action     TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user     ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_comments_ticket  ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_logs_ticket      ON activity_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_tokens(user_id);

-- The default SUPER_ADMIN account is seeded at server boot (see backend/db/init.js)
-- from the DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD environment variables —
-- no credentials are hardcoded here.
