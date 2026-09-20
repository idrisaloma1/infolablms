const router = require('express').Router();
const { pool } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// ── POST /api/progress ────────────────────────────────────
// Body: { lessonId }
// Marks a lesson complete for the logged-in student and recalculates
// the overall enrollment progress percentage.
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required' });
    }

    const { rows: lessonRows } = await pool.query(
      'SELECT id, course_id FROM lessons WHERE id = $1',
      [lessonId]
    );
    if (!lessonRows[0]) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const { course_id: courseId } = lessonRows[0];

    const { rows: enrollRows } = await pool.query(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active'`,
      [req.user.id, courseId]
    );
    if (!enrollRows[0]) {
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }

    await pool.query(
      `INSERT INTO course_progress (user_id, course_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, $3, true, NOW())
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET completed = true, completed_at = NOW()`,
      [req.user.id, courseId, lessonId]
    );

    const { rows: totalRows } = await pool.query(
      `SELECT COUNT(*) FROM lessons WHERE course_id = $1 AND is_published = true`,
      [courseId]
    );
    const { rows: completedRows } = await pool.query(
      `SELECT COUNT(*) FROM course_progress WHERE user_id = $1 AND course_id = $2 AND completed = true`,
      [req.user.id, courseId]
    );
    const total = parseInt(totalRows[0].count, 10);
    const completed = parseInt(completedRows[0].count, 10);
    const percent = total ? Math.round((completed / total) * 100) : 0;

    await pool.query(
      `UPDATE enrollments SET progress = $1 WHERE user_id = $2 AND course_id = $3`,
      [percent, req.user.id, courseId]
    );

    res.json({ message: 'Progress updated', completed, total, progressPercent: percent });
  } catch (err) {
    console.error('Update progress error:', err.message);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// ── GET /api/progress/:courseId ───────────────────────────
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rows } = await pool.query(
      `SELECT lesson_id, completed, completed_at FROM course_progress
       WHERE user_id = $1 AND course_id = $2`,
      [req.user.id, courseId]
    );
    res.json({ progress: rows });
  } catch (err) {
    console.error('Get progress error:', err.message);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

module.exports = router;
