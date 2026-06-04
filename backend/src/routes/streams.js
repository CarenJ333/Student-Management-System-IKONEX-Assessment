const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all streams
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cs.*, COUNT(s.id) AS student_count
      FROM class_streams cs
      LEFT JOIN students s ON s.stream_id = cs.id
      GROUP BY cs.id
      ORDER BY cs.form_level, cs.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single stream
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM class_streams WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Stream not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET students in a stream
router.get('/:id/students', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM students WHERE stream_id = ? ORDER BY last_name, first_name',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET subjects assigned to a stream
router.get('/:id/subjects', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sub.* FROM subjects sub
      JOIN stream_subjects ss ON ss.subject_id = sub.id
      WHERE ss.stream_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create stream
router.post('/', async (req, res) => {
  const { name, form_level, academic_year } = req.body;
  if (!name || !form_level || !academic_year)
    return res.status(400).json({ error: 'name, form_level, and academic_year are required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO class_streams (name, form_level, academic_year) VALUES (?, ?, ?)',
      [name, form_level, academic_year]
    );
    const [rows] = await pool.query('SELECT * FROM class_streams WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'A stream with this name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update stream
router.put('/:id', async (req, res) => {
  const { name, form_level, academic_year } = req.body;
  try {
    await pool.query(
      'UPDATE class_streams SET name=?, form_level=?, academic_year=? WHERE id=?',
      [name, form_level, academic_year, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM class_streams WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE stream
router.delete('/:id', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT id FROM students WHERE stream_id = ?', [req.params.id]);
    if (students.length)
      return res.status(400).json({ error: 'Cannot delete stream with enrolled students' });
    await pool.query('DELETE FROM class_streams WHERE id = ?', [req.params.id]);
    res.json({ message: 'Stream deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
