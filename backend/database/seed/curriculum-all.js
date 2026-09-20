require('dotenv').config();
const { pool } = require('../../src/config/db');

const S3 = 'https://your-s3-bucket.s3.amazonaws.com';

const courseCurricula = {
  'cloud-computing-aws': [
    {
      title: 'Module 1: Cloud Fundamentals',
      free: true,
      lessons: [
        { title: 'Cloud Computing Principles & Deployment Models', materials: ['Cloud Fundamentals Notes'] },
        { title: 'AWS Core Services Overview (EC2, S3, RDS, VPC)', materials: ['AWS Core Services Slides'] },
      ],
    },
    {
      title: 'Module 2: Building on AWS',
      free: false,
      lessons: [
        { title: 'Designing & Deploying Scalable Solutions', materials: ['Solution Architecture Notes'] },
        { title: 'IAM & Access Control Management', materials: ['IAM Slides'] },
      ],
    },
    {
      title: 'Module 3: Optimization & Monitoring',
      free: false,
      lessons: [
        { title: 'Cost Optimization Strategies', materials: ['Cost Optimization Notes'] },
        { title: 'Monitoring & Managing AWS Infrastructure', materials: ['Monitoring Tools Guide'] },
      ],
    },
  ],
  'cybersecurity-isc2': [
    {
      title: 'Module 1: Security Principles',
      free: true,
      lessons: [
        { title: 'Confidentiality, Integrity & Availability', materials: ['Security Principles Notes'] },
      ],
    },
    {
      title: 'Module 2: Incident Response & Business Continuity',
      free: false,
      lessons: [
        { title: 'Incident Response Planning', materials: ['Incident Response Notes'] },
        { title: 'Disaster Recovery & Business Continuity', materials: ['BCP Slides'] },
      ],
    },
    {
      title: 'Module 3: Access Control Domain',
      free: false,
      lessons: [
        { title: 'AAA & Access Control Models (DAC, MAC, RBAC)', materials: ['Access Control Notes'] },
      ],
    },
    {
      title: 'Module 4: Networking & Security Operations',
      free: false,
      lessons: [
        { title: 'Network Security Architectures & Firewalls', materials: ['Networking Notes'] },
        { title: 'Security Operations, Monitoring & SIEM', materials: ['SecOps Slides'] },
      ],
    },
  ],
  'devops-engineering': [
    {
      title: 'Module 1: DevOps Foundations',
      free: true,
      lessons: [
        { title: 'DevOps Principles & Linux Basics', materials: ['DevOps Intro Notes'] },
        { title: 'Version Control with Git & GitHub', materials: ['Git & GitHub Guide'] },
      ],
    },
    {
      title: 'Module 2: CI/CD Pipelines',
      free: false,
      lessons: [
        { title: 'CI/CD with Jenkins', materials: ['Jenkins Setup Notes'] },
        { title: 'GitHub Actions Workflows', materials: ['GitHub Actions Slides'] },
      ],
    },
    {
      title: 'Module 3: Configuration & Containers',
      free: false,
      lessons: [
        { title: 'Configuration Management with Ansible', materials: ['Ansible Playbooks Guide'] },
        { title: 'Containerization with Docker', materials: ['Docker Notes'] },
      ],
    },
    {
      title: 'Module 4: Infrastructure & Orchestration',
      free: false,
      lessons: [
        { title: 'Infrastructure as Code with Terraform', materials: ['Terraform Notes'] },
        { title: 'Monitoring with Nagios', materials: ['Nagios Setup Guide'] },
        { title: 'Orchestration with Kubernetes', materials: ['Kubernetes Notes'] },
      ],
    },
  ],
  'data-analysis': [
    {
      title: 'Module 1: Advanced Excel',
      free: true,
      lessons: [
        { title: 'Advanced Excel Functions for Data Analysis', materials: ['Excel Functions Guide'] },
      ],
    },
    {
      title: 'Module 2: Microsoft Power BI',
      free: false,
      lessons: [
        { title: 'Power BI Data Import & Modeling', materials: ['Power BI Notes'] },
        { title: 'Building Reports & Dashboards', materials: ['Dashboard Design Guide'] },
      ],
    },
    {
      title: 'Module 3: SQL for Data Analysis',
      free: false,
      lessons: [
        { title: 'SQL Queries & Data Manipulation', materials: ['SQL Basics Notes'] },
        { title: 'Advanced SQL: Subqueries & Window Functions', materials: ['Advanced SQL Guide'] },
      ],
    },
    {
      title: 'Module 4: Python for Data Analysis',
      free: false,
      lessons: [
        { title: 'Data Manipulation with Pandas & NumPy', materials: ['Pandas & NumPy Notes'] },
        { title: 'Data Visualization with Matplotlib & Seaborn', materials: ['Visualization Guide'] },
      ],
    },
  ],
  'python-programming': [
    {
      title: 'Module 1: Python Basics',
      free: true,
      lessons: [
        { title: 'Python IDLE, Data Types & Variables', materials: ['Python Basics Notes'] },
        { title: 'Logic Operators & Control Flow', materials: ['Control Flow Guide'] },
      ],
    },
    {
      title: 'Module 2: Core Programming Skills',
      free: false,
      lessons: [
        { title: 'Modules, Functions & Error Handling', materials: ['Functions & Errors Notes'] },
        { title: 'Input/Output & Formatted Strings', materials: ['I/O Guide'] },
      ],
    },
    {
      title: 'Module 3: Intro to Data Analysis with Python',
      free: false,
      lessons: [
        { title: 'Data Analysis Packages: Pandas, NumPy, Matplotlib', materials: ['Data Analysis Intro Notes'] },
      ],
    },
  ],
  'powershell-scripting': [
    {
      title: 'Module 1: PowerShell Basics',
      free: true,
      lessons: [
        { title: 'PowerShell Console & Scripting Files', materials: ['PowerShell Basics Notes'] },
      ],
    },
    {
      title: 'Module 2: Scripting & Automation',
      free: false,
      lessons: [
        { title: 'Command Modules & Cmdlets', materials: ['Cmdlets Guide'] },
        { title: 'Writing & Running PowerShell Scripts', materials: ['Scripting Notes'] },
      ],
    },
  ],
  'ai-automation': [
    {
      title: 'Module 1: AI Fundamentals',
      free: true,
      lessons: [
        { title: 'Introduction to AI & Machine Learning Concepts', materials: ['AI Fundamentals Notes'] },
      ],
    },
    {
      title: 'Module 2: Automation Tools',
      free: false,
      lessons: [
        { title: 'Designing Systems That Learn & Adapt', materials: ['Automation Design Notes'] },
        { title: 'Building Automated Task Execution', materials: ['Automation Build Guide'] },
      ],
    },
  ],
  'ai-software': [
    {
      title: 'Module 1: AI-Assisted Development',
      free: true,
      lessons: [
        { title: 'AI Fundamentals for Developers', materials: ['AI Dev Notes'] },
      ],
    },
    {
      title: 'Module 2: Full-Stack AI Track',
      free: false,
      lessons: [
        { title: 'React & Node.js with AI Tooling', materials: ['React & Node Notes'] },
        { title: 'Databases & Cloud Deployment', materials: ['Deployment Guide'] },
        { title: 'Git, GitHub & Collaborative Workflows', materials: ['Git Workflow Notes'] },
      ],
    },
  ],
  'digital-marketing': [
    {
      title: 'Module 1: Digital Marketing Fundamentals',
      free: true,
      lessons: [
        { title: 'Digital Marketing Strategy & Principles', materials: ['Marketing Fundamentals Notes'] },
      ],
    },
    {
      title: 'Module 2: Paid Advertising',
      free: false,
      lessons: [
        { title: 'Facebook Ads Campaigns', materials: ['Facebook Ads Guide'] },
        { title: 'Google Ads: Search, Display & Video', materials: ['Google Ads Notes'] },
      ],
    },
    {
      title: 'Module 3: Social Media & Analytics',
      free: false,
      lessons: [
        { title: 'Marketing Across Instagram, Twitter, LinkedIn & YouTube', materials: ['Social Platforms Notes'] },
        { title: 'Measuring & Optimizing Campaign Performance', materials: ['Analytics Guide'] },
      ],
    },
  ],
};

async function seedCourse(slug, modules) {
  const { rows: courseRows } = await pool.query('SELECT id FROM courses WHERE slug = $1', [slug]);
  if (!courseRows[0]) {
    console.warn(`Skipping ${slug} — course not found.`);
    return;
  }
  const courseId = courseRows[0].id;

  let modSort = 1;
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
        `INSERT INTO modules (course_id, title, sort_order, is_free) VALUES ($1, $2, $3, $4) RETURNING id`,
        [courseId, mod.title, modSort, mod.free]
      );
      moduleId = rows[0].id;
    }
    modSort++;

    let lessonSort = 1;
    for (const lesson of mod.lessons) {
      const { rows: existingLesson } = await pool.query(
        'SELECT id FROM lessons WHERE module_id = $1 AND title = $2',
        [moduleId, lesson.title]
      );
      let lessonId;
      const slugPart = lesson.title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
      if (existingLesson[0]) {
        lessonId = existingLesson[0].id;
      } else {
        const { rows } = await pool.query(
          `INSERT INTO lessons (module_id, course_id, title, video_url, video_duration, lesson_type, sort_order, is_free, is_published)
           VALUES ($1, $2, $3, $4, $5, 'video', $6, $7, true) RETURNING id`,
          [moduleId, courseId, lesson.title, `${S3}/${slug}-${slugPart}.mp4`, 1200, lessonSort, mod.free]
        );
        lessonId = rows[0].id;
      }
      lessonSort++;

      for (const materialTitle of lesson.materials) {
        const { rows: existingMaterial } = await pool.query(
          'SELECT id FROM lesson_materials WHERE lesson_id = $1 AND title = $2',
          [lessonId, materialTitle]
        );
        if (!existingMaterial[0]) {
          const matSlug = materialTitle.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
          await pool.query(
            `INSERT INTO lesson_materials (lesson_id, title, type, url) VALUES ($1, $2, 'pdf', $3)`,
            [lessonId, materialTitle, `${S3}/${slug}-${matSlug}.pdf`]
          );
        }
      }
    }
  }
  console.log(`Seeded curriculum for ${slug}`);
}

async function main() {
  for (const [slug, modules] of Object.entries(courseCurricula)) {
    await seedCourse(slug, modules);
  }
  console.log('All curricula seeded.');
  await pool.end();
}

main().catch((err) => {
  console.error('Curriculum seed failed:', err.message);
  process.exit(1);
});
