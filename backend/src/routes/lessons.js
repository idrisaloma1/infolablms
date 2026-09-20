const router = require('express').Router();
const { pool } = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

// ── GET /api/lessons/course/:courseId ─────────────────────
// Returns modules -> lessons -> materials for a course.
// If the requester is an enrolled (active) student, they get full
// video/material access. Otherwise only is_free lessons unlock.
router.get('/course/:courseId', optionalAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    let isEnrolled = false;
    if (req.user) {
      const { rows: enrollRows } = await pool.query(
        `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active'`,
        [req.user.id, courseId]
      );
      isEnrolled = !!enrollRows[0];
    }

    const { rows: moduleRows } = await pool.query(
      `SELECT id, title, description, sort_order, is_free
       FROM modules WHERE course_id = $1 ORDER BY sort_order`,
      [courseId]
    );

    const { rows: lessonRows } = await pool.query(
      `SELECT id, module_id, title, video_url, video_duration, lesson_type, sort_order, is_free
       FROM lessons WHERE course_id = $1 AND is_published = true ORDER BY sort_order`,
      [courseId]
    );

    const lessonIds = lessonRows.map((l) => l.id);
    let materialsByLesson = {};
    let completedLessonIds = new Set();

    if (lessonIds.length) {
      const { rows: materialRows } = await pool.query(
        `SELECT id, lesson_id, title, type, url, size
         FROM lesson_materials WHERE lesson_id = ANY($1::uuid[])`,
        [lessonIds]
      );
      materialsByLesson = materialRows.reduce((acc, m) => {
        (acc[m.lesson_id] = acc[m.lesson_id] || []).push(m);
        return acc;
      }, {});

      if (req.user) {
        const { rows: progressRows } = await pool.query(
          `SELECT lesson_id FROM course_progress
           WHERE user_id = $1 AND course_id = $2 AND completed = true`,
          [req.user.id, courseId]
        );
        completedLessonIds = new Set(progressRows.map((p) => p.lesson_id));
      }
    }

    const modules = moduleRows.map((mod) => ({
      id: mod.id,
      title: mod.title,
      description: mod.description,
      lessons: lessonRows
        .filter((l) => l.module_id === mod.id)
        .map((l) => {
          const unlocked = l.is_free || isEnrolled;
          return {
            id: l.id,
            title: l.title,
            lesson_type: l.lesson_type,
            video_duration: l.video_duration,
            is_free: l.is_free,
            unlocked,
            completed: completedLessonIds.has(l.id),
            video_url: unlocked ? l.video_url : null,
            materials: unlocked ? (materialsByLesson[l.id] || []) : [],
          };
        }),
    }));

    const totalLessons = lessonRows.length;
    const completedCount = completedLessonIds.size;

    res.json({
      isEnrolled,
      totalLessons,
      completedCount,
      progressPercent: totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0,
      modules,
    });
  } catch (err) {
    console.error('Get curriculum error:', err.message);
    res.status(500).json({ error: 'Failed to fetch course curriculum' });
  }
});

module.exports = router;
