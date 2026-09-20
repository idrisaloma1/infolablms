require('dotenv').config();
const { pool } = require('../../src/config/db');

async function main() {
  const { rows: courseRows } = await pool.query(
    "SELECT id FROM courses WHERE slug = 'full-stack-web-development'"
  );
  if (!courseRows[0]) {
    throw new Error('Course full-stack-web-development not found — run npm run seed first.');
  }
  const courseId = courseRows[0].id;

  const modules = [
    { title: 'Module 1: HTML & CSS Foundations', sort_order: 1, is_free: true },
    { title: 'Module 2: JavaScript Essentials', sort_order: 2, is_free: false },
    { title: 'Module 3: Django Back-End', sort_order: 3, is_free: false },
  ];

  for (const mod of modules) {
    const { rows: existingModule } = await pool.query(
      'SELECT id FROM modules WHERE course_id = $1 AND title = $2',
      [courseId, mod.title]
    );
    let moduleId;
    if (existingModule[0]) {
      moduleId = existingModule[0].id;
    } else {
      const { rows } = await pool.query(
        `INSERT INTO modules (course_id, title, sort_order, is_free)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [courseId, mod.title, mod.sort_order, mod.is_free]
      );
      moduleId = rows[0].id;
    }

    const lessons = mod.title.includes('Module 1')
      ? [
          { title: 'Day 1: Intro to HTML', video_url: 'https://your-s3-bucket.s3.amazonaws.com/placeholder-day1.mp4', is_free: true, materials: ['Day 1 - HTML Notes'] },
          { title: 'Day 2: CSS Basics', video_url: 'https://your-s3-bucket.s3.amazonaws.com/placeholder-day2.mp4', is_free: true, materials: ['Day 2 - CSS Slides'] },
        ]
      : mod.title.includes('Module 2')
      ? [
          { title: 'Day 3: JS Fundamentals', video_url: 'https://your-s3-bucket.s3.amazonaws.com/placeholder-day3.mp4', is_free: false, materials: ['Day 3 - JS Notes'] },
          { title: 'Day 4: DOM Manipulation', video_url: 'https://your-s3-bucket.s3.amazonaws.com/placeholder-day4.mp4', is_free: false, materials: ['Day 4 - DOM Slides'] },
        ]
      : [
          { title: 'Day 5: Django Setup', video_url: 'https://your-s3-bucket.s3.amazonaws.com/placeholder-day5.mp4', is_free: false, materials: ['Day 5 - Django Notes'] },
        ];

    let sortOrder = 1;
    for (const lesson of lessons) {
      const { rows: existingLesson } = await pool.query(
        'SELECT id FROM lessons WHERE module_id = $1 AND title = $2',
        [moduleId, lesson.title]
      );
      let lessonId;
      if (existingLesson[0]) {
        lessonId = existingLesson[0].id;
      } else {
        const { rows } = await pool.query(
          `INSERT INTO lessons (module_id, course_id, title, video_url, video_duration, lesson_type, sort_order, is_free, is_published)
           VALUES ($1, $2, $3, $4, $5, 'video', $6, $7, true)
           RETURNING id`,
          [moduleId, courseId, lesson.title, lesson.video_url, 1200, sortOrder, lesson.is_free]
        );
        lessonId = rows[0].id;
      }
      sortOrder++;

      for (const materialTitle of lesson.materials) {
        const { rows: existingMaterial } = await pool.query(
          'SELECT id FROM lesson_materials WHERE lesson_id = $1 AND title = $2',
          [lessonId, materialTitle]
        );
        if (!existingMaterial[0]) {
          await pool.query(
            `INSERT INTO lesson_materials (lesson_id, title, type, url)
             VALUES ($1, $2, 'pdf', $3)`,
            [lessonId, materialTitle, `https://your-s3-bucket.s3.amazonaws.com/placeholder-${materialTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`]
          );
        }
      }
    }
  }

  console.log('Curriculum seeded for Full Stack Web Development.');
  await pool.end();
}

main().catch((err) => {
  console.error('Curriculum seed failed:', err.message);
  process.exit(1);
});
