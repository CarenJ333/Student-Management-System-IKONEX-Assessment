const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Strip time portion from ISO date strings so MySQL accepts them
const formatDate = (val) => {
  if (!val) return null;
  return val.toString().split('T')[0];
};

// GET all students
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, cs.name AS stream_name
      FROM students s
      JOIN class_streams cs ON cs.id = s.stream_id
      ORDER BY s.last_name, s.first_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, cs.name AS stream_name
      FROM students s
      JOIN class_streams cs ON cs.id = s.stream_id
      WHERE s.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create student
router.post('/', async (req, res) => {
  const {
    student_number, first_name, last_name, date_of_birth,
    gender, email, phone, address, stream_id, enrollment_date
  } = req.body;

  if (!student_number || !first_name || !last_name || !stream_id)
    return res.status(400).json({ error: 'student_number, first_name, last_name, and stream_id are required' });

  try {
    const [result] = await pool.query(`
      INSERT INTO students
        (student_number, first_name, last_name, date_of_birth, gender, email, phone, address, stream_id, enrollment_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_number, first_name, last_name, formatDate(date_of_birth),
        gender || null, email || null, phone || null,
        address || null, stream_id, formatDate(enrollment_date)]);

    const [rows] = await pool.query(
      'SELECT s.*, cs.name AS stream_name FROM students s JOIN class_streams cs ON cs.id = s.stream_id WHERE s.id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Student number already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  const {
    student_number, first_name, last_name, date_of_birth,
    gender, email, phone, address, stream_id, status
  } = req.body;
  try {
    await pool.query(`
      UPDATE students SET
        student_number=?, first_name=?, last_name=?, date_of_birth=?,
        gender=?, email=?, phone=?, address=?, stream_id=?, status=?
      WHERE id=?
    `, [student_number, first_name, last_name, formatDate(date_of_birth),
        gender || null, email || null, phone || null,
        address || null, stream_id, status || 'Active', req.params.id]);

    const [rows] = await pool.query(
      'SELECT s.*, cs.name AS stream_name FROM students s JOIN class_streams cs ON cs.id = s.stream_id WHERE s.id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;