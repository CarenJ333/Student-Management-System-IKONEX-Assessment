const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ikonex_academy',
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully to Aiven');
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection failed. Full error details:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
};

module.exports = { pool, testConnection };
