const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all subjects
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single subject
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Subject not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create subject
router.post('/', async (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code)
    return res.status(400).json({ error: 'name and code are required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO subjects (name, code, description) VALUES (?, ?, ?)',
      [name, code, description || null]
    );
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Subject code already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  const { name, code, description } = req.body;
  try {
    await pool.query(
      'UPDATE subjects SET name=?, code=?, description=? WHERE id=?',
      [name, code, description || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST assign subject to stream
router.post('/assign', async (req, res) => {
  const { stream_id, subject_id } = req.body;
  if (!stream_id || !subject_id)
    return res.status(400).json({ error: 'stream_id and subject_id are required' });
  try {
    await pool.query(
      'INSERT IGNORE INTO stream_subjects (stream_id, subject_id) VALUES (?, ?)',
      [stream_id, subject_id]
    );
    res.json({ message: 'Subject assigned to stream successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove subject from stream
router.delete('/assign/:stream_id/:subject_id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM stream_subjects WHERE stream_id = ? AND subject_id = ?',
      [req.params.stream_id, req.params.subject_id]
    );
    res.json({ message: 'Subject removed from stream successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
