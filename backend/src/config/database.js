const mysql = require('mysql2/promise');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'ikonex_academy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Aiven requires SSL
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed. Full error details:');
    console.error('   Error code:', err.code);
    console.error('   Error message:', err.message);
    console.error('   Host attempted:', process.env.DB_HOST || 'NOT SET - using localhost');
    console.error('   Port attempted:', process.env.DB_PORT || 'NOT SET - using 3306');
    console.error('   User attempted:', process.env.DB_USER || 'NOT SET - using root');
    console.error('   Database attempted:', process.env.DB_NAME || 'NOT SET');
    process.exit(1);
  }
}

module.exports = { pool, testConnection };