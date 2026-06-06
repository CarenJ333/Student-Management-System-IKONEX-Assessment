// jest.setup.js - Global test setup
const { pool } = require('./src/config/database');

// Graceful shutdown of the pool after all tests
afterAll(async () => {
  try {
    await pool.end();
  } catch (err) {
    console.error('Error closing database pool:', err.message);
  }
});
