/**
 * routes/tickets.js
 * Employee-facing ticket routes (create, list own, withdraw, comments).
 * PostgreSQL (pg) syntax — $1, $2... placeholders, result.rows / RETURNING.
 */
const router = require('express').Router();
const { pool }        = require('../db/init');
const { verifyToken } = require('../middleware/auth');
const upload          = require('../middleware/upload');

const ADMIN_ROLES = ['SUPER_ADMIN', 'TECH_ADMIN'];

const logActivity = async (ticketId, userName, action) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (ticket_id, user_name, action) VALUES ($1, $2, $3)',
      [ticketId, userName, action]
    );
  } catch (_) {}
};

// GET /api/tickets/mine — current user's active tickets
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tickets
       WHERE user_id = $1 AND is_withdrawn = FALSE
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets — create new ticket (multipart/form-data for optional image)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const {
      category, subCategory, locationZone,
      deskNumber, desktopId, details, priority,
    } = req.body;

    if (!category || !locationZone)
      return res.status(400).json({ message: 'Category and location are required.' });

    const ts        = Date.now().toString(36).toUpperCase();
    const rand      = Math.floor(Math.random() * 9000 + 1000);
    const ticketRef = `TKT-${ts}-${rand}`;
    const imageUrl  = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO tickets
         (ticket_ref, user_id, category, sub_category, location_zone,
          desk_number, desktop_id, details, priority, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        ticketRef, req.user.id, category,
        subCategory || null, locationZone,
        deskNumber  || null, desktopId || null,
        details     || null, priority  || 'Medium',
        imageUrl,
      ]
    );

    const newTicket = result.rows[0];
    await logActivity(newTicket.id, req.user.name, 'opened this ticket');
    res.status(201).json(newTicket);
  } catch (err) {
    console.error('[CreateTicket]', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tickets/:id/withdraw — soft delete by owner
router.put('/:id/withdraw', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id FROM tickets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Ticket not found.' });

    const ticket = result.rows[0];
    if (ticket.user_id !== req.user.id && !ADMIN_ROLES.includes(req.user.role))
      return res.status(403).json({ message: 'You can only withdraw your own tickets.' });

    await pool.query(
      "UPDATE tickets SET is_withdrawn = TRUE, status = 'Withdrawn' WHERE id = $1",
      [req.params.id]
    );
    await logActivity(req.params.id, req.user.name, 'withdrew (cancelled) this ticket');
    res.json({ message: 'Ticket withdrawn.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/:id/comments
router.get('/:id/comments', verifyToken, async (req, res) => {
  try {
    // Employees only see public comments; admins (SUPER_ADMIN/TECH_ADMIN) see all
    const isAdmin = ADMIN_ROLES.includes(req.user.role);
    const filter  = isAdmin ? '' : 'AND c.is_internal = FALSE';
    const result  = await pool.query(
      `SELECT c.*, u.name AS author_name, u.role AS author_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.ticket_id = $1 ${filter}
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets/:id/comments
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content, isInternal } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Comment cannot be empty.' });

    const internal = ADMIN_ROLES.includes(req.user.role) && Boolean(isInternal);

    const inserted = await pool.query(
      'INSERT INTO comments (ticket_id, user_id, content, is_internal) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.params.id, req.user.id, content.trim(), internal]
    );

    const result = await pool.query(
      `SELECT c.*, u.name AS author_name, u.role AS author_role
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [inserted.rows[0].id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/:id/logs
router.get('/:id/logs', verifyToken, async (req, res) => {
  try {
    // TECH_ADMIN cannot access audit logs (same restriction as CSV export)
    if (req.user.role === 'TECH_ADMIN')
      return res.status(403).json({ message: 'Audit logs are restricted to super admins.' });

    const result = await pool.query(
      'SELECT * FROM activity_logs WHERE ticket_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
