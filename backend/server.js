/**
 * server.js — Pillar 5 Group IT Ticketing System
 * Entry point. Wires middleware, mounts routes, starts the server.
 * Optimized for Render deployment.
 */
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { initDB } = require('./db/init');

const authRoutes   = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const adminRoutes  = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ────────────────────────────────────────
app.use(cors({
  origin:       process.env.ALLOWED_ORIGIN || '*',
  methods:      ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin',   adminRoutes);

// Health check (useful for Render's health checks)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// 404 catch-all
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

// ── Boot with retry logic ────────────────────────────────────
let dbInitAttempts = 0;
const MAX_DB_ATTEMPTS = 5;
const DB_RETRY_DELAY = 3000; // 3 seconds

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n🚀  Pillar 5 API  →  http://localhost:${PORT}\n`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    dbInitAttempts++;
    if (dbInitAttempts < MAX_DB_ATTEMPTS) {
      console.error(`❌ DB connection failed. Retrying in ${DB_RETRY_DELAY}ms... (Attempt ${dbInitAttempts}/${MAX_DB_ATTEMPTS})`);
      setTimeout(startServer, DB_RETRY_DELAY);
    } else {
      console.error('❌ Database initialisation failed after multiple attempts. Exiting.');
      process.exit(1);
    }
  }
}

startServer();
