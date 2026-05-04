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
  console.log('Database tables ready');
}

initDB();

module.exports = pool;
