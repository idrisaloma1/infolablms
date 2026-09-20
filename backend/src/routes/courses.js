const router = require('express').Router();
const { pool } = require('../config/db');

// ── GET /api/courses ───────────────────────────────────────
// Optional query params: ?featured=true, ?category=<slug>
router.get('/', async (req, res) => {
  try {
    const { featured, category } = req.query;
    const conditions = ['c.is_published = true'];
    const params = [];

    if (featured === 'true') {
      conditions.push('c.is_featured = true');
    }

    if (category) {
      params.push(category);
      conditions.push(`cat.slug = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT
         c.id, c.title, c.slug, c.description, c.short_description,
         c.price, c.discount_price, c.is_free, c.is_featured,
         c.thumbnail_url, c.total_students, c.rating, c.total_ratings,
         c.certificate_available, c.created_at,
         cat.name AS category_name, cat.slug AS category_slug
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );

    res.json({ courses: rows });
  } catch (err) {
    console.error('Get courses error:', err.message);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// ── GET /api/courses/:slug ─────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { rows } = await pool.query(
      `SELECT
         c.id, c.title, c.slug, c.description, c.short_description,
         c.price, c.discount_price, c.is_free, c.is_featured,
         c.thumbnail_url, c.preview_video_url, c.level, c.language,
         c.duration_weeks, c.requirements, c.what_you_learn, c.tags,
         c.total_students, c.total_lessons, c.total_duration,
         c.rating, c.total_ratings, c.certificate_available, c.created_at,
         cat.name AS category_name, cat.slug AS category_slug
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.slug = $1 AND c.is_published = true`,
      [slug]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course: rows[0] });
  } catch (err) {
    console.error('Get course detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

module.exports = router;
