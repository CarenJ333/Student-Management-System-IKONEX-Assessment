const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET scores — optionally filter by student or assessment
router.get('/', async (req, res) => {
  try {
    const { student_id, assessment_id } = req.query;
    let query = `
      SELECT sc.*, s.first_name, s.last_name, s.student_number,
             a.name AS assessment_name, a.type, a.max_score,
             sub.name AS subject_name, cs.name AS stream_name
      FROM scores sc
      JOIN students s ON s.id = sc.student_id
      JOIN assessments a ON a.id = sc.assessment_id
      JOIN subjects sub ON sub.id = a.subject_id
      JOIN class_streams cs ON cs.id = a.stream_id
      WHERE 1=1
    `;
    const params = [];
    if (student_id)   { query += ' AND sc.student_id = ?';   params.push(student_id); }
    if (assessment_id){ query += ' AND sc.assessment_id = ?'; params.push(assessment_id); }
    query += ' ORDER BY s.last_name, s.first_name';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit score (prevents duplicates via UNIQUE constraint)
router.post('/', async (req, res) => {
  const { student_id, assessment_id, score, remarks } = req.body;

  if (student_id === undefined || assessment_id === undefined || score === undefined)
    return res.status(400).json({ error: 'student_id, assessment_id, and score are required' });

  if (score < 0)
    return res.status(400).json({ error: 'Score cannot be negative' });

  try {
    // Validate score does not exceed max
    const [assessments] = await pool.query('SELECT max_score FROM assessments WHERE id = ?', [assessment_id]);
    if (!assessments.length) return res.status(404).json({ error: 'Assessment not found' });
    if (parseFloat(score) > parseFloat(assessments[0].max_score))
      return res.status(400).json({ error: `Score cannot exceed maximum of ${assessments[0].max_score}` });

    const [result] = await pool.query(
      'INSERT INTO scores (student_id, assessment_id, score, remarks) VALUES (?, ?, ?, ?)',
      [student_id, assessment_id, score, remarks || null]
    );
    const [rows] = await pool.query('SELECT * FROM scores WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Score already exists for this student and assessment. Use PUT to update.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update score
router.put('/:id', async (req, res) => {
  const { score, remarks } = req.body;
  if (score === undefined) return res.status(400).json({ error: 'score is required' });
  if (score < 0) return res.status(400).json({ error: 'Score cannot be negative' });

  try {
    const [existing] = await pool.query('SELECT * FROM scores WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Score not found' });

    const [assessments] = await pool.query('SELECT max_score FROM assessments WHERE id = ?', [existing[0].assessment_id]);
    if (parseFloat(score) > parseFloat(assessments[0].max_score))
      return res.status(400).json({ error: `Score cannot exceed maximum of ${assessments[0].max_score}` });

    await pool.query('UPDATE scores SET score=?, remarks=? WHERE id=?', [score, remarks || null, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM scores WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE score
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM scores WHERE id = ?', [req.params.id]);
    res.json({ message: 'Score deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk submit scores for an assessment
router.post('/bulk', async (req, res) => {
  const { assessment_id, scores } = req.body;
  if (!assessment_id || !Array.isArray(scores))
    return res.status(400).json({ error: 'assessment_id and scores array are required' });

  const [assessments] = await pool.query('SELECT max_score FROM assessments WHERE id = ?', [assessment_id]);
  if (!assessments.length) return res.status(404).json({ error: 'Assessment not found' });
  const maxScore = parseFloat(assessments[0].max_score);

  const errors = [];
  const inserted = [];

  for (const entry of scores) {
    if (parseFloat(entry.score) > maxScore) {
      errors.push({ student_id: entry.student_id, error: `Score exceeds max of ${maxScore}` });
      continue;
    }
    try {
      await pool.query(
        'INSERT INTO scores (student_id, assessment_id, score, remarks) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score=VALUES(score), remarks=VALUES(remarks)',
        [entry.student_id, assessment_id, entry.score, entry.remarks || null]
      );
      inserted.push(entry.student_id);
    } catch (err) {
      errors.push({ student_id: entry.student_id, error: err.message });
    }
  }

  res.json({ inserted: inserted.length, errors });
});

module.exports = router;
