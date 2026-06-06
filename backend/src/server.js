const express = require('express');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Add this after the dotenv section
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');
console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('========================');


const { testConnection } = require('./config/database');
const streamsRouter = require('./routes/streams');
const studentsRouter = require('./routes/students');
const subjectsRouter = require('./routes/subjects');
const assessmentsRouter = require('./routes/assessments');
const scoresRouter = require('./routes/scores');
const resultsRouter = require('./routes/results');
const reportsRouter = require('./routes/reports');
const gradingRouter = require('./routes/grading');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/streams',     streamsRouter);
app.use('/api/students',    studentsRouter);
app.use('/api/subjects',    subjectsRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/scores',      scoresRouter);
app.use('/api/results',     resultsRouter);
app.use('/api/reports',     reportsRouter);
app.use('/api/grading',     gradingRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ikonex Academy API running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.get('/debug-db-config', (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    NODE_ENV: process.env.NODE_ENV
  });
});

app.listen(PORT, async () => {
  await testConnection();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
