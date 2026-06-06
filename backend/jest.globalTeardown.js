// jest.globalTeardown.js - Cleanup after all tests complete
module.exports = async () => {
  const { pool } = require('./src/config/database');
  try {
    if (pool) {
      await pool.end();
      console.log('Database pool closed successfully');
    }
  } catch (err) {
    console.error('Error closing database pool in globalTeardown:', err.message);
  }
};
