const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// ── PostgreSQL Pool (for direct queries) ──────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 120000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('connect', () => {
  console.log('✅ Database connected!');
});

pool.on('error', (err) => {
  console.error('❌ Database error:', err.message);
});

// ── Supabase Client (for storage, auth helpers) ───────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { realtime: { transport: ws } }
);

// ── Supabase Admin Client (for admin operations) ──────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { transport: ws } }
);

module.exports = { pool, supabase, supabaseAdmin };
