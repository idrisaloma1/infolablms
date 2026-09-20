const router = require('express').Router();
const crypto = require('crypto');
const { pool } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

function generateCertificateNo(courseSlug) {
  const prefix = courseSlug.split('-')[0].toUpperCase().slice(0, 4);
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `IIT-${prefix}-${random}`;
}

// ── POST /api/certificates/generate ───────────────────────
// Body: { courseId }
// Issues a certificate if the student is enrolled and has 100% progress.
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const { rows: enrollRows } = await pool.query(
      `SELECT id, progress, status FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [req.user.id, courseId]
    );
    if (!enrollRows[0]) {
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }
    if (enrollRows[0].progress < 100) {
      return res.status(400).json({
        error: 'Course not yet complete',
        progress: enrollRows[0].progress,
      });
    }

    const { rows: existingCert } = await pool.query(
      'SELECT id, certificate_no FROM certificates WHERE user_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );
    if (existingCert[0]) {
      return res.status(200).json({
        message: 'Certificate already issued',
        certificate: existingCert[0],
      });
    }

    const { rows: courseRows } = await pool.query(
      'SELECT slug, title FROM courses WHERE id = $1',
      [courseId]
    );
    if (!courseRows[0]) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let certificateNo;
    let inserted = null;
    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      certificateNo = generateCertificateNo(courseRows[0].slug);
      try {
        const { rows } = await pool.query(
          `INSERT INTO certificates (user_id, course_id, enrollment_id, certificate_no, issued_at, is_valid)
           VALUES ($1, $2, $3, $4, NOW(), true)
           RETURNING id, certificate_no, issued_at`,
          [req.user.id, courseId, enrollRows[0].id, certificateNo]
        );
        inserted = rows[0];
      } catch (e) {
        if (e.code !== '23505') throw e; // retry only on unique violation
      }
    }
    if (!inserted) {
      return res.status(500).json({ error: 'Could not generate a unique certificate number, please retry' });
    }

    await pool.query(
      `UPDATE enrollments SET status = 'completed', completed_at = NOW() WHERE id = $1`,
      [enrollRows[0].id]
    );

    res.status(201).json({ message: 'Certificate issued!', certificate: inserted });
  } catch (err) {
    console.error('Generate certificate error:', err.message);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// ── GET /api/certificates ──────────────────────────────────
// Lists the logged-in student's certificates.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ce.id, ce.certificate_no, ce.issued_at, ce.is_valid,
              c.title AS course_title, c.slug AS course_slug
       FROM certificates ce
       JOIN courses c ON ce.course_id = c.id
       WHERE ce.user_id = $1
       ORDER BY ce.issued_at DESC`,
      [req.user.id]
    );
    res.json({ certificates: rows });
  } catch (err) {
    console.error('Get certificates error:', err.message);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// ── GET /api/certificates/verify/:certificateNo ────────────
// Public verification endpoint — no auth required.
router.get('/verify/:certificateNo', async (req, res) => {
  try {
    const { certificateNo } = req.params;
    const { rows } = await pool.query(
      `SELECT ce.certificate_no, ce.issued_at, ce.is_valid, ce.revoked_at,
              u.name AS student_name, c.title AS course_title
       FROM certificates ce
       JOIN users u ON ce.user_id = u.id
       JOIN courses c ON ce.course_id = c.id
       WHERE ce.certificate_no = $1`,
      [certificateNo]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Certificate not found', valid: false });
    }
    res.json({ valid: rows[0].is_valid, certificate: rows[0] });
  } catch (err) {
    console.error('Verify certificate error:', err.message);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

module.exports = router;
