const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all assessments
router.get('/', async (req, res) => {
  try {
    const { stream_id, subject_id, term, academic_year } = req.query;
    let query = `
      SELECT a.*, cs.name AS stream_name, sub.name AS subject_name
      FROM assessments a
      JOIN class_streams cs ON cs.id = a.stream_id
      JOIN subjects sub ON sub.id = a.subject_id
      WHERE 1=1
    `;
    const params = [];
    if (stream_id)    { query += ' AND a.stream_id = ?';    params.push(stream_id); }
    if (subject_id)   { query += ' AND a.subject_id = ?';   params.push(subject_id); }
    if (term)         { query += ' AND a.term = ?';         params.push(term); }
    if (academic_year){ query += ' AND a.academic_year = ?';params.push(academic_year); }
    query += ' ORDER BY a.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single assessment
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, cs.name AS stream_name, sub.name AS subject_name
      FROM assessments a
      JOIN class_streams cs ON cs.id = a.stream_id
      JOIN subjects sub ON sub.id = a.subject_id
      WHERE a.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Assessment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create assessment
router.post('/', async (req, res) => {
  const { name, type, stream_id, subject_id, max_score, weight, academic_year, term } = req.body;
  if (!name || !type || !stream_id || !subject_id || !academic_year || !term)
    return res.status(400).json({ error: 'name, type, stream_id, subject_id, academic_year, and term are required' });
  try {
    const [result] = await pool.query(`
      INSERT INTO assessments (name, type, stream_id, subject_id, max_score, weight, academic_year, term)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, type, stream_id, subject_id, max_score || 100, weight || 100, academic_year, term]);
    const [rows] = await pool.query('SELECT * FROM assessments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update assessment
router.put('/:id', async (req, res) => {
  const { name, type, stream_id, subject_id, max_score, weight, academic_year, term } = req.body;
  try {
    await pool.query(`
      UPDATE assessments SET name=?, type=?, stream_id=?, subject_id=?, max_score=?, weight=?, academic_year=?, term=?
      WHERE id=?
    `, [name, type, stream_id, subject_id, max_score, weight, academic_year, term, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM assessments WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE assessment
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM assessments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Assessment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
