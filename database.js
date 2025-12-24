const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// Initialize database
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_week INTEGER NOT NULL,
        total_weeks INTEGER NOT NULL,
        current_week INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'Not Started',
        priority VARCHAR(20) DEFAULT 'Medium',
        notes TEXT,
        team_members TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
};

initDB();

module.exports = pool;