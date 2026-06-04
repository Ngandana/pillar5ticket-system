-- ============================================================
-- Pillar 5 Group — IT Ticketing System
-- PostgreSQL Schema
-- Run once with: psql -U your_user -d your_database -f schema.sql
-- ============================================================

-- Create enums
CREATE TYPE user_role AS ENUM ('Employee', 'Admin');
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Waiting on User', 'Resolved', 'Withdrawn');

-- Users
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       user_role DEFAULT 'Employee',
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

-- Default admin seed (password: Admin@Pillar5!)
INSERT INTO users (name, email, password, role)
VALUES (
  'System Admin',
  's.ngandana@pillar5group.co.za',
  '$2b$12$uJQ/.oH2QTeOSHo0q.Rjcu46J.UiVg3sFB0YvlqeCA2d.Ou6jucd2',
  'Admin'
)
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT id, name, email, role FROM users;
