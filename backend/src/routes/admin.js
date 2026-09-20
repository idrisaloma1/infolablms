const router = require('express').Router();
const { pool } = require('../config/db');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

router.use(authMiddleware, requireAdmin);

// ── GET /api/admin/stats ───────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { rows: userRows } = await pool.query(
      `SELECT role, COUNT(*) FROM users GROUP BY role`
    );
    const { rows: courseRows } = await pool.query(
      `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_published) AS published FROM courses`
    );
    const { rows: enrollRows } = await pool.query(
      `SELECT status, COUNT(*) FROM enrollments GROUP BY status`
    );
    const { rows: certRows } = await pool.query(
      `SELECT COUNT(*) FROM certificates WHERE is_valid = true`
    );
    const { rows: revenueRows } = await pool.query(
      `SELECT COALESCE(SUM(c.price), 0) AS total_revenue
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.status IN ('active', 'completed')`
    );

    res.json({
      usersByRole: userRows,
      courses: courseRows[0],
      enrollmentsByStatus: enrollRows,
      certificatesIssued: certRows[0].count,
      estimatedRevenue: revenueRows[0].total_revenue,
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── GET /api/admin/students ─────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
              COUNT(e.id) AS enrollment_count
       FROM users u
       LEFT JOIN enrollments e ON e.user_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ students: rows });
  } catch (err) {
    console.error('Admin students error:', err.message);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ── GET /api/admin/students/:id ──────────────────────────────
router.get('/students/:id', async (req, res) => {
  try {
    const { rows: userRows } = await pool.query(
      `SELECT id, name, email, phone, gender, state, is_active, created_at
       FROM users WHERE id = $1 AND role = 'student'`,
      [req.params.id]
    );
    if (!userRows[0]) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { rows: enrollRows } = await pool.query(
      `SELECT e.id, e.status, e.progress, e.enrolled_at, c.title AS course_title, c.slug
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.params.id]
    );

    res.json({ student: userRows[0], enrollments: enrollRows });
  } catch (err) {
    console.error('Admin student detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// ── GET /api/admin/enrollments ───────────────────────────────
// Optional query: ?status=active
router.get('/enrollments', async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let whereClause = '';
    if (status) {
      params.push(status);
      whereClause = `WHERE e.status = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT e.id, e.status, e.progress, e.enrolled_at, e.completed_at,
              u.id AS user_id, u.name AS student_name, u.email AS student_email,
              c.id AS course_id, c.title AS course_title, c.price
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       ${whereClause}
       ORDER BY e.enrolled_at DESC`,
      params
    );
    res.json({ enrollments: rows });
  } catch (err) {
    console.error('Admin enrollments error:', err.message);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// ── PATCH /api/admin/enrollments/:id ─────────────────────────
// Body: { status }
router.patch('/enrollments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'active', 'completed', 'cancelled', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const { rows } = await pool.query(
      `UPDATE enrollments SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, req.params.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment updated', enrollment: rows[0] });
  } catch (err) {
    console.error('Admin update enrollment error:', err.message);
    res.status(500).json({ error: 'Failed to update enrollment' });
  }
});

module.exports = router;
