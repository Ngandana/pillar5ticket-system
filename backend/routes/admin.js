/**
 * routes/admin.js
 * Admin-only routes with tiered access control
 * SUPER_ADMIN: full access (assign, escalate, etc.)
 * TECH_ADMIN: can respond and update status, but not assign or escalate
 */
const router = require('express').Router();
const { pool }            = require('../db/init');
const { verifySuperAdmin, verifyAdminOnly, verifyTechAdmin } = require('../middleware/auth');

const logActivity = async (ticketId, userName, action) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (ticket_id, user_name, action) VALUES ($1, $2, $3)',
      [ticketId, userName, action]
    );
  } catch (_) {}
};

// ── Triage Queue (TECH_ADMIN+) ──────────────────────────────
router.get('/tickets', verifyTechAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          t.*,
          u.name  AS requester_name,
          u.email AS requester_email,
          a.name  AS assignee_name
       FROM tickets t
       JOIN users u ON t.user_id = u.id
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
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── KPI Stats (TECH_ADMIN+) ─────────────────────────────────
router.get('/stats', verifyTechAdmin, async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) AS count FROM tickets WHERE is_withdrawn=FALSE");
    const open = await pool.query("SELECT COUNT(*) AS count FROM tickets WHERE status IN ('Open','In Progress') AND is_withdrawn=FALSE");
    const high = await pool.query("SELECT COUNT(*) AS count FROM tickets WHERE priority IN ('High','Critical') AND status != 'Resolved' AND is_withdrawn=FALSE");
    const resolved = await pool.query("SELECT COUNT(*) AS count FROM tickets WHERE status='Resolved' AND is_withdrawn=FALSE");
    const today = await pool.query("SELECT COUNT(*) AS count FROM tickets WHERE DATE(created_at)=CURRENT_DATE AND is_withdrawn=FALSE");

    res.json({
      total: total.rows[0].count,
      open: open.rows[0].count,
      high: high.rows[0].count,
      resolved: resolved.rows[0].count,
      today: today.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Tech List (TECH_ADMIN+) ─────────────────────────────────
router.get('/techs', verifyTechAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE role IN ('SUPER_ADMIN', 'TECH_ADMIN') ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update Ticket (SUPER_ADMIN only for assigning) ─────────
router.put('/tickets/:id', verifyTechAdmin, async (req, res) => {
  try {
    const { status, priority, assigned_to } = req.body;
    const ticketId = req.params.id;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

    const current = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (current.rows.length === 0) return res.status(404).json({ message: 'Ticket not found.' });
    const old = current.rows[0];

    // TECH_ADMIN can update status/priority but NOT assign
    if (!isSuperAdmin && assigned_to && assigned_to !== old.assigned_to) {
      return res.status(403).json({ message: 'Only super admin can assign tickets.' });
    }

    // TECH_ADMIN cannot escalate priority above current (security)
    if (!isSuperAdmin && priority) {
      const priorityRank = { Low: 1, Medium: 2, High: 3, Critical: 4 };
      if (priorityRank[priority] > priorityRank[old.priority]) {
        return res.status(403).json({ message: 'Only super admin can escalate priority.' });
      }
    }

    await pool.query(
      'UPDATE tickets SET status=$1, priority=$2, assigned_to=$3 WHERE id=$4',
      [status, priority, assigned_to || null, ticketId]
    );

    // Log changes
    if (old.status !== status)
      await logActivity(ticketId, req.user.name, `changed status to "${status}"`);
    if (old.priority !== priority)
      await logActivity(ticketId, req.user.name, `changed priority to "${priority}"`);
    if (isSuperAdmin && String(old.assigned_to || '') !== String(assigned_to || ''))
      await logActivity(ticketId, req.user.name, 'updated assignment');

    res.json({ message: 'Ticket updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Activity Logs (TECH_ADMIN+) ─────────────────────────────
router.get('/export', verifyAdminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT al.id, t.ticket_ref, t.category, t.status, al.user_name, al.action, al.created_at
       FROM activity_logs al
       JOIN tickets t ON al.ticket_id = t.id
       ORDER BY al.created_at DESC`
    );

    const logs = result.rows;
    const header = 'ID,Ticket Ref,Category,Status,User,Action,Timestamp\n';
    const body   = logs
      .map(l =>
        [l.id, l.ticket_ref, l.category, l.status, l.user_name,
         `"${l.action.replace(/"/g, '""')}"`,
         new Date(l.created_at).toISOString()
        ].join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="p5-audit-${Date.now()}.csv"`);
    res.send(header + body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
