require('dotenv').config();
const { pool } = require('../../src/config/db');

const categories = [
  { name: 'Web Development', slug: 'web-development' },
  { name: 'Cloud Computing', slug: 'cloud-computing' },
  { name: 'Cyber Security', slug: 'cyber-security' },
  { name: 'DevOps', slug: 'devops' },
  { name: 'Data Analysis', slug: 'data-analysis' },
  { name: 'Programming', slug: 'programming' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { name: 'Digital Marketing', slug: 'digital-marketing' },
];

const courses = [
  {
    slug: 'full-stack-web-development',
    title: 'Full Stack Web Development',
    price: 550000,
    short_description: 'Master HTML, CSS, Bootstrap, JavaScript, and Django (Python) to build dynamic, real-world web applications.',
    description: 'Master HTML, CSS, Bootstrap, JavaScript, and Django (Python) to build dynamic, real-world web applications from front-end to back-end. Instructor: Engineer Sogunle Idris.',
    category_slug: 'web-development',
    is_featured: true,
  },
  {
    slug: 'cloud-computing-aws',
    title: 'Cloud Computing (AWS)',
    price: 250000,
    short_description: 'Gain hands-on proficiency with AWS core services and prepare for AWS certification exams.',
    description: 'Gain hands-on proficiency with AWS core services — EC2, S3, RDS, VPC, IAM — and prepare for AWS certification exams. Instructor: Engineer Ogunbona Hakeem.',
    category_slug: 'cloud-computing',
    is_featured: true,
  },
  {
    slug: 'cybersecurity-isc2',
    title: 'Cyber Security (ISC2 Foundational)',
    price: 200000,
    short_description: 'Build a strong foundation across the five ISC2 domains of cybersecurity.',
    description: 'Build a strong foundation across the five ISC2 domains: security principles, incident response, access control, networking, and security operations. Instructor: Eng (Dr) Idris Alao Sogunle.',
    category_slug: 'cyber-security',
    is_featured: true,
  },
  {
    slug: 'devops-engineering',
    title: 'DevOps Engineering',
    price: 800000,
    short_description: 'Learn Git/GitHub, CI/CD, Ansible, Docker, Terraform, Nagios, and Kubernetes on AWS.',
    description: 'Learn Git/GitHub, CI/CD with Jenkins and GitHub Actions, configuration management with Ansible, containerization with Docker, infrastructure as code with Terraform, monitoring with Nagios, and orchestration with Kubernetes — all on the AWS platform. Instructor: Eng.(Dr.) Idris Alao Sogunle.',
    category_slug: 'devops',
    is_featured: false,
  },
  {
    slug: 'data-analysis',
    title: 'Data Analysis',
    price: 200000,
    short_description: 'Build data analysis skills with Advanced Excel, Power BI, SQL, and Python.',
    description: 'Build data analysis skills with Advanced Excel, Microsoft Power BI, SQL, and Python (Pandas, NumPy, Matplotlib, Seaborn) to analyze, visualize, and interpret data. Instructor: Mr Oyebisi David.',
    category_slug: 'data-analysis',
    is_featured: false,
  },
  {
    slug: 'python-programming',
    title: 'Programming Languages (Python)',
    price: 100000,
    short_description: 'A thorough introduction to Python programming and data types.',
    description: 'A thorough introduction to Python — data types, variables, logic operators, modules, functions, error handling, and an introduction to Python for data analysis. Instructor: Mr Ishola Yusuf.',
    category_slug: 'programming',
    is_featured: false,
  },
  {
    slug: 'powershell-scripting',
    title: 'Scripting Languages',
    price: 100000,
    short_description: 'A thorough introduction to PowerShell scripting and cmdlets.',
    description: 'A thorough introduction to PowerShell, PowerShell Console, Scripting File, Command Module, Windows PowerShell commands, called cmdlets. Instructor: Mr Victor Obioha.',
    category_slug: 'programming',
    is_featured: false,
  },
  {
    slug: 'ai-automation',
    title: 'Artificial Intelligence and Automation',
    price: 150000,
    short_description: 'Master AI fundamentals and automation tools for intelligent systems.',
    description: 'Master AI fundamentals and automation tools to design systems that learn, adapt, and execute tasks without manual input. Instructor: Mr Baruwa Samad.',
    category_slug: 'artificial-intelligence',
    is_featured: false,
  },
  {
    slug: 'ai-software',
    title: 'Artificial Intelligence for Software Developers',
    price: 150000,
    short_description: 'Master AI fundamentals alongside React, Node.js, databases, and cloud deployment.',
    description: 'Master AI fundamentals and Tech Track, React and Node.js leveraging AI, databases, cloud deployment, Git and GitHub. Instructor: Dr Sogunle Idris.',
    category_slug: 'artificial-intelligence',
    is_featured: false,
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing',
    price: 200000,
    short_description: 'Learn to create, manage, and optimize campaigns with Facebook Ads and Google Ads.',
    description: 'Learn to create, manage, and optimize digital marketing campaigns using Facebook Ads, Google Ads, and various social media platforms to reach target audiences. Instructor: Mr Olusanya Ahmed.',
    category_slug: 'digital-marketing',
    is_featured: false,
  },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await pool.query(
      `INSERT INTO categories (name, slug, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (slug) DO NOTHING`,
      [cat.name, cat.slug]
    );
  }

  const { rows: catRows } = await pool.query('SELECT id, slug FROM categories');
  const categoryMap = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  console.log('Seeding courses...');
  for (const course of courses) {
    const categoryId = categoryMap[course.category_slug] || null;
    await pool.query(
      `INSERT INTO courses (title, slug, description, short_description, category_id, price, is_published, is_featured, certificate_available)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7, true)
       ON CONFLICT (slug) DO NOTHING`,
      [course.title, course.slug, course.description, course.short_description, categoryId, course.price, course.is_featured]
    );
  }

  console.log('Done seeding.');
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
