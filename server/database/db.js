const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error('DB init error:', err.message);
      }
    }
  }

  // Migrations for email authentication columns
  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP`,
    // Mark pre-existing accounts (no token assigned) as verified so they aren't locked out
    `UPDATE users SET is_verified = TRUE WHERE is_verified = FALSE AND verification_token IS NULL`,
  ];
  for (const m of migrations) {
    try { await pool.query(m); } catch (err) { console.error('Migration error:', err.message); }
  }

  console.log('Database tables ready');
}

initDB();

module.exports = pool;
