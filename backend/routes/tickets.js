/**
 * routes/tickets.js
 * Employee-facing ticket routes (create, list own, withdraw, comments).
 */
const router = require('express').Router();
const { pool }        = require('../db/init');
const { verifyToken } = require('../middleware/auth');
const upload          = require('../middleware/upload');

const logActivity = async (ticketId, userName, action) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (ticket_id, user_name, action) VALUES (?, ?, ?)',
      [ticketId, userName, action]
    );
  } catch (_) {}
};

// GET /api/tickets/mine — current user's active tickets
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tickets
       WHERE user_id = ? AND is_withdrawn = FALSE
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
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

    const [result] = await pool.query(
      `INSERT INTO tickets
         (ticket_ref, user_id, category, sub_category, location_zone,
          desk_number, desktop_id, details, priority, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketRef, req.user.id, category,
        subCategory || null, locationZone,
        deskNumber  || null, desktopId || null,
        details     || null, priority  || 'Medium',
        imageUrl,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
    await logActivity(result.insertId, req.user.name, 'opened this ticket');
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[CreateTicket]', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tickets/:id/withdraw — soft delete by owner
router.put('/:id/withdraw', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM tickets WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found.' });
    if (rows[0].user_id !== req.user.id && req.user.role !== 'Admin')
      return res.status(403).json({ message: 'You can only withdraw your own tickets.' });

    await pool.query(
      "UPDATE tickets SET is_withdrawn = TRUE, status = 'Withdrawn' WHERE id = ?",
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
    // Employees only see public comments; admins see all
    const filter = req.user.role === 'Admin' ? '' : 'AND c.is_internal = FALSE';
    const [rows] = await pool.query(
      `SELECT c.*, u.name AS author_name, u.role AS author_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.ticket_id = ? ${filter}
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets/:id/comments
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content, isInternal } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Comment cannot be empty.' });

    const internal = req.user.role === 'Admin' && Boolean(isInternal);

    const [result] = await pool.query(
      'INSERT INTO comments (ticket_id, user_id, content, is_internal) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, content.trim(), internal]
    );
    const [rows] = await pool.query(
      `SELECT c.*, u.name AS author_name, u.role AS author_role
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/:id/logs
router.get('/:id/logs', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM activity_logs WHERE ticket_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
