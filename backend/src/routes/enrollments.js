const router = require('express').Router();
const { pool } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// ── POST /api/enrollments ─────────────────────────────────
// Body: { courseId }
// Enrolls the logged-in student in a course. Marks status 'active'
// immediately since payments aren't wired up yet — handled manually offline.
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const { rows: courseRows } = await pool.query(
      'SELECT id, title, is_published FROM courses WHERE id = $1',
      [courseId]
    );
    if (!courseRows[0]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (!courseRows[0].is_published) {
      return res.status(400).json({ error: 'This course is not currently available' });
    }

    const { rows: existing } = await pool.query(
      'SELECT id, status FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );
    if (existing[0]) {
      return res.status(400).json({
        error: 'You are already enrolled in this course',
        enrollment: existing[0],
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
       VALUES ($1, $2, 'active', NOW())
       RETURNING id, user_id, course_id, status, enrolled_at, progress`,
      [req.user.id, courseId]
    );

    res.status(201).json({ message: 'Enrolled successfully!', enrollment: rows[0] });
  } catch (err) {
    console.error('Enrollment error:', err.message);
    res.status(500).json({ error: 'Enrollment failed. Please try again.' });
  }
});

// ── GET /api/enrollments ──────────────────────────────────
// Returns the logged-in student's enrollments, joined with course info.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         e.id, e.status, e.progress, e.enrolled_at, e.completed_at,
         c.id AS course_id, c.title, c.slug, c.short_description,
         c.thumbnail_url, c.price
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    res.json({ enrollments: rows });
  } catch (err) {
    console.error('Get enrollments error:', err.message);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

module.exports = router;
