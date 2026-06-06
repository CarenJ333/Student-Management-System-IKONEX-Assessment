// src/tests/setup.js
// Shared test database helpers
const { pool } = require('../config/database');

async function clearTestData() {
  await pool.query('DELETE FROM scores WHERE student_id IN (SELECT id FROM students WHERE student_number LIKE "TEST%")');
  await pool.query('DELETE FROM students WHERE student_number LIKE "TEST%"');
  await pool.query('DELETE FROM assessments WHERE name LIKE "TEST%"');
  await pool.query('DELETE FROM class_streams WHERE name LIKE "TEST%"');
  await pool.query('DELETE FROM subjects WHERE code LIKE "TEST%"');
}

async function createTestStream() {
  const [result] = await pool.query(
    'INSERT INTO class_streams (name, form_level, academic_year) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
    ['TEST-Stream-1A', 1, '2024/2025']
  );
  return result.insertId;
}

async function createTestStudent(streamId, suffix = '001') {
  const [result] = await pool.query(
    `INSERT INTO students (student_number, first_name, last_name, stream_id)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
    [`TEST${suffix}`, 'Test', `Student${suffix}`, streamId]
  );
  return result.insertId;
}

async function createTestSubject() {
  const [result] = await pool.query(
    'INSERT INTO subjects (name, code) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
    ['TEST Subject', 'TEST101']
  );
  return result.insertId;
}

async function createTestAssessment(streamId, subjectId, type = 'Exam') {
  const [result] = await pool.query(
    `INSERT INTO assessments (name, type, stream_id, subject_id, max_score, weight, academic_year, term)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [`TEST ${type} Assessment`, type, streamId, subjectId, 100, 100, '2024/2025', 'Term 1']
  );
  return result.insertId;
}

module.exports = { pool, clearTestData, createTestStream, createTestStudent, createTestSubject, createTestAssessment };
