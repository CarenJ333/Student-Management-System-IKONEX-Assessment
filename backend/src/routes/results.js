const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Helper: get grade from score
async function getGrade(pool, score) {
  const [grades] = await pool.query(
    'SELECT * FROM grading_scales WHERE ? BETWEEN min_score AND max_score LIMIT 1',
    [score]
  );
  return grades.length ? grades[0] : { grade: 'U', label: 'Fail', points: 0 };
}

// GET student results — all subjects, totals, average, grade, overall position
router.get('/student/:student_id', async (req, res) => {
  try {
    const { term, academic_year } = req.query;
    const { student_id } = req.params;

    // Get student info
    const [students] = await pool.query(
      'SELECT s.*, cs.name AS stream_name FROM students s JOIN class_streams cs ON cs.id = s.stream_id WHERE s.id = ?',
      [student_id]
    );
    if (!students.length) return res.status(404).json({ error: 'Student not found' });
    const student = students[0];

    // Get all scores for this student
    let scoreQuery = `
      SELECT sc.score, a.max_score, a.weight, a.type, a.term, a.academic_year,
             sub.id AS subject_id, sub.name AS subject_name, sub.code
      FROM scores sc
      JOIN assessments a ON a.id = sc.assessment_id
      JOIN subjects sub ON sub.id = a.subject_id
      WHERE sc.student_id = ?
    `;
    const params = [student_id];
    if (term)          { scoreQuery += ' AND a.term = ?';         params.push(term); }
    if (academic_year) { scoreQuery += ' AND a.academic_year = ?';params.push(academic_year); }

    const [scores] = await pool.query(scoreQuery, params);

    // Group by subject
    const subjectMap = {};
    for (const row of scores) {
      if (!subjectMap[row.subject_id]) {
        subjectMap[row.subject_id] = {
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          code: row.code,
          scores: [],
          total: 0,
          max_total: 0,
        };
      }
      subjectMap[row.subject_id].scores.push(row);
      subjectMap[row.subject_id].total     += parseFloat(row.score);
      subjectMap[row.subject_id].max_total += parseFloat(row.max_score);
    }

    // Calculate percentage and grade per subject
    const subjectResults = [];
    let grandTotal = 0;
    let grandMaxTotal = 0;

    for (const subj of Object.values(subjectMap)) {
      const percentage = subj.max_total > 0
        ? (subj.total / subj.max_total) * 100
        : 0;
      const gradeInfo = await getGrade(pool, percentage);
      subjectResults.push({
        ...subj,
        percentage: Math.round(percentage * 100) / 100,
        grade: gradeInfo.grade,
        grade_label: gradeInfo.label,
        points: gradeInfo.points,
      });
      grandTotal    += subj.total;
      grandMaxTotal += subj.max_total;
    }

    const overallPercentage = grandMaxTotal > 0 ? (grandTotal / grandMaxTotal) * 100 : 0;
    const overallGrade = await getGrade(pool, overallPercentage);

    res.json({
      student,
      subjects: subjectResults,
      summary: {
        total_marks: Math.round(grandTotal * 100) / 100,
        max_marks: grandMaxTotal,
        average: Math.round(overallPercentage * 100) / 100,
        grade: overallGrade.grade,
        grade_label: overallGrade.label,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET class results — all students ranked by performance
router.get('/class/:stream_id', async (req, res) => {
  try {
    const { term, academic_year, subject_id } = req.query;
    const { stream_id } = req.params;

    // Get all students in the stream
    const [students] = await pool.query(
      'SELECT * FROM students WHERE stream_id = ? AND status = "Active" ORDER BY last_name, first_name',
      [stream_id]
    );

    const results = [];

    for (const student of students) {
      let scoreQuery = `
        SELECT sc.score, a.max_score, a.subject_id
        FROM scores sc
        JOIN assessments a ON a.id = sc.assessment_id
        WHERE sc.student_id = ? AND a.stream_id = ?
      `;
      const params = [student.id, stream_id];
      if (subject_id)   { scoreQuery += ' AND a.subject_id = ?';   params.push(subject_id); }
      if (term)         { scoreQuery += ' AND a.term = ?';         params.push(term); }
      if (academic_year){ scoreQuery += ' AND a.academic_year = ?';params.push(academic_year); }

      const [scores] = await pool.query(scoreQuery, params);
      const total    = scores.reduce((sum, s) => sum + parseFloat(s.score), 0);
      const maxTotal = scores.reduce((sum, s) => sum + parseFloat(s.max_score), 0);
      const average  = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
      const gradeInfo = await getGrade(pool, average);

      results.push({
        student_id: student.id,
        student_number: student.student_number,
        first_name: student.first_name,
        last_name: student.last_name,
        total_marks: Math.round(total * 100) / 100,
        max_marks: maxTotal,
        average: Math.round(average * 100) / 100,
        grade: gradeInfo.grade,
        grade_label: gradeInfo.label,
        subjects_entered: scores.length,
      });
    }

    // Sort by average descending and assign positions
    results.sort((a, b) => b.average - a.average);
    results.forEach((r, i) => { r.position = i + 1; });

    res.json({ stream_id, results, total_students: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET subject performance for a class
router.get('/subject/:subject_id/stream/:stream_id', async (req, res) => {
  try {
    const { subject_id, stream_id } = req.params;
    const { term, academic_year } = req.query;

    let query = `
      SELECT s.id AS student_id, s.first_name, s.last_name, s.student_number,
             SUM(sc.score) AS total, SUM(a.max_score) AS max_total
      FROM students s
      JOIN scores sc ON sc.student_id = s.id
      JOIN assessments a ON a.id = sc.assessment_id
      WHERE s.stream_id = ? AND a.subject_id = ?
    `;
    const params = [stream_id, subject_id];
    if (term)         { query += ' AND a.term = ?';         params.push(term); }
    if (academic_year){ query += ' AND a.academic_year = ?';params.push(academic_year); }
    query += ' GROUP BY s.id ORDER BY total DESC';

    const [rows] = await pool.query(query, params);
    const withGrades = await Promise.all(rows.map(async (r) => {
      const pct = r.max_total > 0 ? (r.total / r.max_total) * 100 : 0;
      const g = await getGrade(pool, pct);
      return { ...r, percentage: Math.round(pct * 100) / 100, grade: g.grade, grade_label: g.label };
    }));

    withGrades.forEach((r, i) => { r.subject_position = i + 1; });
    res.json(withGrades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET grading scales
router.get('/grading-scales', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM grading_scales ORDER BY min_score DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
