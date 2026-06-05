/**
 * routes/admin.js
 * All admin-only routes — master queue, stats, tech list, update, CSV export.
 */
const router = require('express').Router();
const { pool }       = require('../db/init');
const { verifyAdmin } = require('../middleware/auth');

const logActivity = async (ticketId, userName, action) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (ticket_id, user_name, action) VALUES ($1, $2, $3)',
      [ticketId, userName, action]
    );
  } catch (_) {}
};

// GET /api/admin/tickets — full master queue
router.get('/tickets', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          t.*,
          u.name  AS requester_name,
          u.email AS requester_email,
          a.name  AS assignee_name
       FROM tickets t
       JOIN  users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.is_withdrawn = FALSE
       ORDER BY
         CASE t.priority
           WHEN 'Critical' THEN 1
           WHEN 'High' THEN 2
           WHEN 'Medium' THEN 3
           ELSE 4
         END,
         t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats — KPI counts
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalRes    = await pool.query("SELECT COUNT(*) AS total FROM tickets WHERE is_withdrawn=FALSE");
    const openRes     = await pool.query("SELECT COUNT(*) AS open  FROM tickets WHERE status IN ('Open','In Progress') AND is_withdrawn=FALSE");
    const highRes     = await pool.query("SELECT COUNT(*) AS high  FROM tickets WHERE priority IN ('High','Critical') AND status != 'Resolved' AND is_withdrawn=FALSE");
    const resolvedRes = await pool.query("SELECT COUNT(*) AS resolved FROM tickets WHERE status='Resolved' AND is_withdrawn=FALSE");
    const todayRes    = await pool.query("SELECT COUNT(*) AS today FROM tickets WHERE DATE(created_at)=CURRENT_DATE AND is_withdrawn=FALSE");
    const total    = totalRes.rows[0].total;
    const open     = openRes.rows[0].open;
    const high     = highRes.rows[0].high;
    const resolved = resolvedRes.rows[0].resolved;
    const today    = todayRes.rows[0].today;
    res.json({ total, open, high, resolved, today });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/techs — list of admin users for assignment dropdown
router.get('/techs', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE role='Admin' ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/tickets/:id — update status, priority, assignee
router.put('/tickets/:id', verifyAdmin, async (req, res) => {
  try {
    const { status, priority, assigned_to } = req.body;
    const ticketId = req.params.id;

    const currentRes = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (currentRes.rows.length === 0) return res.status(404).json({ message: 'Ticket not found.' });
    const old = currentRes.rows[0];

    await pool.query(
      'UPDATE tickets SET status=$1, priority=$2, assigned_to=$3 WHERE id=$4',
      [status, priority, assigned_to || null, ticketId]
    );

    // Auto-generate granular audit entries
    if (old.status   !== status)
      await logActivity(ticketId, req.user.name, `changed status from "${old.status}" to "${status}"`);
    if (old.priority !== priority)
      await logActivity(ticketId, req.user.name, `changed priority from "${old.priority}" to "${priority}"`);
    if (String(old.assigned_to || '') !== String(assigned_to || ''))
      await logActivity(ticketId, req.user.name, `updated ticket assignment`);

    res.json({ message: 'Ticket updated successfully.' });
  } catch (err) {
    console.error('[AdminUpdate]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/export — download full audit log as CSV
router.get('/export', verifyAdmin, async (req, res) => {
  try {
    const logsRes = await pool.query(
      `SELECT al.id, t.ticket_ref, t.category, t.status, al.user_name, al.action, al.created_at
       FROM activity_logs al
       JOIN tickets t ON al.ticket_id = t.id
       ORDER BY al.created_at DESC`
    );

    const header = 'ID,Ticket Ref,Category,Status,User,Action,Timestamp\n';
    const body   = logsRes.rows
      .map(l =>
        [l.id, l.ticket_ref, l.category, l.status, l.user_name,
         `"${l.action.replace(/"/g, '""')}"`,
         new Date(l.created_at).toISOString()
        ].join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="pillar5-audit-${Date.now()}.csv"`);
    res.send(header + body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
