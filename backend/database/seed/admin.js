require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../../src/config/db');

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD not set in .env');
  }

  const { rows: existing } = await pool.query(
    'SELECT id, role FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  if (existing[0]) {
    await pool.query(`UPDATE users SET role = 'super_admin' WHERE id = $1`, [existing[0].id]);
    console.log(`Existing user ${email} promoted to super_admin.`);
  } else {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'super_admin')`,
      ['IIT Admin', email.trim().toLowerCase(), hash]
    );
    console.log(`Admin account created: ${email}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Admin seed failed:', err.message);
  process.exit(1);
});
