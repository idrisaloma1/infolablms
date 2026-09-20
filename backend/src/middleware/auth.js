const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

// ── Verify JWT Token ──────────────────────────────────────
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists and is active
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, avatar_url FROM users WHERE id=$1',
      [decoded.id]
    );
    if (!rows[0]) return res.status(401).json({ error: 'User not found' });
    if (!rows[0].is_active) return res.status(403).json({ error: 'Account suspended' });

    req.user = { ...decoded, ...rows[0] };
    next();
  } catch(e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Role Guard ────────────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (roles.includes(req.user.role) || req.user.role === 'super_admin') return next();
    return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  };
}

// ── Admin Only ────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!['admin', 'super_admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ── Optional Auth (doesn't fail if no token) ─────────────
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch(e) {}
  next();
}

module.exports = { authMiddleware, requireRole, requireAdmin, optionalAuth };
