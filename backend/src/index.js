require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4000;

// ── SECURITY MIDDLEWARE ────────────────────────────────────
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── RATE LIMITING ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' }
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', apiLimiter);

// ── ROUTES ────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/courses',      require('./routes/courses'));
app.use('/api/categories',   require('./routes/categories'));
app.use('/api/enrollments',  require('./routes/enrollments'));
app.use('/api/payments',     require('./routes/payments'));
app.use('/api/lessons',      require('./routes/lessons'));
app.use('/api/progress',     require('./routes/progress'));
app.use('/api/quizzes',      require('./routes/quizzes'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/settings',     require('./routes/settings'));
app.use('/api/announcements',require('./routes/announcements'));
app.use('/api/upload',       require('./routes/upload'));

// ── HEALTH CHECK ──────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'IIT LMS API',
  version: '1.0.0',
  timestamp: new Date().toISOString()
}));

// ── ERROR HANDLER ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

// ── START ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   IIT LMS — Backend API                  ║
  ║   Running on port ${PORT}                    ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;