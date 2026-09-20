const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;

// ── Email Transporter ─────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: '74.125.133.108',
    port: 465,
    secure: true,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: (process.env.SMTP_PASS || '').replace(/\s/g, '')
    },
    tls: { rejectUnauthorized: false, servername: 'smtp.gmail.com' }
  });
}

// ── Sign JWT ──────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── POST /api/auth/register ───────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, gender, state } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]
    );
    if (existing[0]) {
      return res.status(400).json({ error: 'Email already registered. Please login.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, gender, state, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'student')
       RETURNING id, name, email, role, avatar_url, created_at`,
      [name.trim(), email.trim().toLowerCase(), hash, phone || null, gender || null, state || null]
    );

    const user = rows[0];
    const token = signToken(user);

    // Send welcome email
    sendWelcomeEmail(user).catch(e => console.error('Welcome email failed:', e.message));

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch(e) {
    console.error('Register error:', e.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]
    );
    if (!rows[0]) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been suspended. Contact support.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    pool.query('UPDATE users SET last_login=NOW() WHERE id=$1', [user.id]).catch(() => {});

    const token = signToken(user);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        phone: user.phone
      }
    });
  } catch(e) {
    console.error('Login error:', e.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, phone, avatar_url, bio, occupation,
              gender, date_of_birth, address, state, country,
              is_active, is_verified, last_login, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json(rows[0] || {});
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PATCH /api/auth/profile ───────────────────────────────
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, bio, occupation, gender, date_of_birth, address, state, country } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET
        name=$1, phone=$2, bio=$3, occupation=$4, gender=$5,
        date_of_birth=$6, address=$7, state=$8, country=$9, updated_at=NOW()
       WHERE id=$10
       RETURNING id, name, email, role, phone, avatar_url, bio, occupation, gender, state`,
      [name, phone||null, bio||null, occupation||null, gender||null,
       date_of_birth||null, address||null, state||null, country||'Nigeria', req.user.id]
    );
    res.json(rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/auth/change-password ───────────────────────
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { rows } = await pool.query(
      'SELECT id, name, email FROM users WHERE LOWER(email)=LOWER($1)', [email.trim()]
    );

    // Always return success (security)
    if (!rows[0]) return res.json({ message: 'If this email exists, a reset link has been sent.' });

    const user = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await pool.query(
      `INSERT INTO site_settings (key, value, type, label)
       VALUES ($1, $2, 'text', 'password_reset')
       ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
      [`reset_${user.id}`, JSON.stringify({ token, expiresAt })]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&uid=${user.id}`;
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"IIT Lagos LMS" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset — IIT Lagos LMS',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#0a1628;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h2 style="color:#fff;margin:0">IIT Lagos LMS</h2>
            <p style="color:rgba(255,255,255,0.5);font-size:13px">Password Reset Request</p>
          </div>
          <div style="background:#f8fafc;padding:28px;border-radius:0 0 12px 12px">
            <p>Dear <strong>${user.name}</strong>,</p>
            <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
            <div style="text-align:center;margin:28px 0">
              <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
                Reset My Password
              </a>
            </div>
            <p style="font-size:12px;color:#999">If you didn't request this, ignore this email.</p>
            <p style="font-size:12px;color:#999">Link: ${resetUrl}</p>
          </div>
        </div>`
    });

    res.json({ message: 'Reset link sent! Check your email.' });
  } catch(e) {
    console.error('Forgot password error:', e.message);
    res.status(500).json({ error: 'Failed to send reset email. Try again.' });
  }
});

// ── POST /api/auth/reset-password ────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, userId, newPassword } = req.body;
    if (!token || !userId || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const { rows } = await pool.query(
      `SELECT value FROM site_settings WHERE key=$1`, [`reset_${userId}`]
    );
    if (!rows[0]) return res.status(400).json({ error: 'Invalid or expired reset link' });

    const stored = JSON.parse(rows[0].value);
    if (stored.token !== token) return res.status(400).json({ error: 'Invalid reset token' });
    if (new Date() > new Date(stored.expiresAt)) return res.status(400).json({ error: 'Reset link expired. Request a new one.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, userId]);
    await pool.query(`DELETE FROM site_settings WHERE key=$1`, [`reset_${userId}`]);

    res.json({ message: 'Password reset successfully! You can now login.' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/auth/users (admin only) ─────────────────────
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { rows } = await pool.query(
      `SELECT id, name, email, role, phone, is_active, is_verified, last_login, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Welcome Email ─────────────────────────────────────────
async function sendWelcomeEmail(user) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"IIT Lagos LMS" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Welcome to IIT Lagos LMS!',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#0a1628;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h2 style="color:#fff;margin:0">Welcome to <span style="color:#2563eb">IIT Lagos</span></h2>
        </div>
        <div style="background:#f8fafc;padding:28px;border-radius:0 0 12px 12px">
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>Your account has been created successfully! You can now browse and enroll in our courses.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${process.env.CLIENT_URL}/courses" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">
              Browse Courses
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="font-size:11px;color:#999">IIT Lagos — Empowering Nigeria Through Tech</p>
        </div>
      </div>`
  });
}

module.exports = router;
