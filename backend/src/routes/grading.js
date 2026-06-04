const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM grading_scales ORDER BY min_score DESC');
  res.json(rows);
});

router.put('/:id', async (req, res) => {
  const { grade, min_score, max_score, label, points } = req.body;
  await pool.query(
    'UPDATE grading_scales SET grade=?, min_score=?, max_score=?, label=?, points=? WHERE id=?',
    [grade, min_score, max_score, label, points, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM grading_scales WHERE id=?', [req.params.id]);
  res.json(rows[0]);
});

module.exports = router;
