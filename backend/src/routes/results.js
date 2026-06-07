const express = require('express');
const router  = express.Router();
const { pool } = require('../config/database');

async function getGrade(score) {
  const [grades] = await pool.query(
    'SELECT * FROM grading_scales WHERE ? BETWEEN min_score AND max_score LIMIT 1',
    [score]
  );
  return grades.length ? grades[0] : { grade: 'U', label: 'Fail', points: 0 };
}

async function getStudentSubjectScore(student_id, subject_id, stream_id, term, academic_year) {
  let query = `
    SELECT sc.score, a.max_score, a.type
    FROM scores sc
    JOIN assessments a ON a.id = sc.assessment_id
    WHERE sc.student_id=? AND a.subject_id=? AND a.stream_id=?
  `;
  const params = [student_id, subject_id, stream_id];
  if (term)          { query += ' AND a.term=?';          params.push(term); }
  if (academic_year) { query += ' AND a.academic_year=?'; params.push(academic_year); }

  const [scores] = await pool.query(query, params);

  const examScores = scores.filter(s => s.type === 'Exam');
  const caScores   = scores.filter(s => ['CA','Quiz','Assignment'].includes(s.type));

  const examTotal    = examScores.reduce((s, r) => s + parseFloat(r.score), 0);
  const examMax      = examScores.reduce((s, r) => s + parseFloat(r.max_score), 0);
  const examWeighted = examMax > 0 ? (examTotal / examMax) * 70 : 0;

  const caTotal    = caScores.reduce((s, r) => s + parseFloat(r.score), 0);
  const caMax      = caScores.reduce((s, r) => s + parseFloat(r.max_score), 0);
  const caWeighted = caMax > 0 ? (caTotal / caMax) * 30 : 0;

  const combined = Math.round((examWeighted + caWeighted) * 100) / 100;
  return {
    exam_score: Math.round(examWeighted * 100) / 100,
    ca_score:   Math.round(caWeighted   * 100) / 100,
    combined,
    has_scores: scores.length > 0 && combined > 0,
  };
}

// GET student results
router.get('/student/:student_id', async (req, res) => {
  try {
    const { term, academic_year, subject_id } = req.query;
    const { student_id } = req.params;

    const [students] = await pool.query(
      'SELECT s.*, cs.name AS stream_name, cs.id AS stream_id FROM students s JOIN class_streams cs ON cs.id = s.stream_id WHERE s.id = ?',
      [student_id]
    );
    if (!students.length) return res.status(404).json({ error: 'Student not found' });
    const student = students[0];

    let subjectQuery = `
      SELECT sub.id, sub.name, sub.code FROM subjects sub
      JOIN stream_subjects ss ON ss.subject_id = sub.id
      WHERE ss.stream_id = ?
    `;
    const subjectParams = [student.stream_id];
    if (subject_id) { subjectQuery += ' AND sub.id = ?'; subjectParams.push(subject_id); }
    const [streamSubjects] = await pool.query(subjectQuery, subjectParams);

    const [classStudentsAll] = await pool.query(
      "SELECT id FROM students WHERE stream_id=? AND status='Active'", [student.stream_id]
    );

    const subjectResults = [];
    let grandTotal = 0;

    for (const subj of streamSubjects) {
      const scores = await getStudentSubjectScore(student_id, subj.id, student.stream_id, term, academic_year);
      if (!scores.has_scores) continue;

      const subjectScores = [];
      for (const cs of classStudentsAll) {
        const sc = await getStudentSubjectScore(cs.id, subj.id, student.stream_id, term, academic_year);
        if (sc.has_scores) subjectScores.push({ id: cs.id, combined: sc.combined });
      }
      subjectScores.sort((a, b) => b.combined - a.combined);
      const subjectPos = subjectScores.findIndex(s => String(s.id) === String(student_id)) + 1;

      const gradeInfo = await getGrade(scores.combined);
      subjectResults.push({
        subject_id:       subj.id,
        subject_name:     subj.name,
        code:             subj.code,
        exam_score:       scores.exam_score,
        ca_score:         scores.ca_score,
        combined:         scores.combined,
        grade:            gradeInfo.grade,
        grade_label:      gradeInfo.label,
        points:           gradeInfo.points,
        subject_position: subjectPos,
        out_of:           subjectScores.length,
      });
      grandTotal += scores.combined;
    }

    const average      = subjectResults.length > 0 ? grandTotal / subjectResults.length : 0;
    const overallGrade = await getGrade(average);

    let subjectPosition = null;
    if (subject_id && subjectResults.length === 1) {
      subjectPosition = {
        position: subjectResults[0].subject_position,
        out_of:   subjectResults[0].out_of,
      };
    }

    res.json({
      student,
      subjects: subjectResults,
      subject_position: subjectPosition,
      summary: {
        total_subjects: subjectResults.length,
        total_points:   Math.round(grandTotal * 100) / 100,
        average:        Math.round(average    * 100) / 100,
        grade:          overallGrade.grade,
        grade_label:    overallGrade.label,
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET class results
router.get('/class/:stream_id', async (req, res) => {
  try {
    const { term, academic_year } = req.query;
    const { stream_id } = req.params;

    const [students] = await pool.query(
      "SELECT * FROM students WHERE stream_id=? AND status='Active' ORDER BY last_name, first_name",
      [stream_id]
    );
    const [streamSubjects] = await pool.query(
      'SELECT sub.id FROM subjects sub JOIN stream_subjects ss ON ss.subject_id=sub.id WHERE ss.stream_id=?',
      [stream_id]
    );

    const results = [];
    for (const student of students) {
      let grandTotal = 0, subjectCount = 0;
      for (const subj of streamSubjects) {
        const sc = await getStudentSubjectScore(student.id, subj.id, stream_id, term, academic_year);
        if (sc.has_scores) { grandTotal += sc.combined; subjectCount++; }
      }
      const average   = subjectCount > 0 ? grandTotal / subjectCount : 0;
      const gradeInfo = await getGrade(average);
      results.push({
        student_id:     student.id,
        student_number: student.student_number,
        first_name:     student.first_name,
        last_name:      student.last_name,
        total_points:   Math.round(grandTotal * 100) / 100,
        average:        Math.round(average    * 100) / 100,
        subjects_count: subjectCount,
        grade:          gradeInfo.grade,
        grade_label:    gradeInfo.label,
      });
    }

    results.sort((a, b) => b.average - a.average);
    results.forEach((r, i) => { r.position = i + 1; });
    res.json({ stream_id, results, total_students: results.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET subject performance
router.get('/subject/:subject_id/stream/:stream_id', async (req, res) => {
  try {
    const { subject_id, stream_id } = req.params;
    const { term, academic_year }   = req.query;

    const [students] = await pool.query(
      "SELECT * FROM students WHERE stream_id=? AND status='Active' ORDER BY last_name, first_name",
      [stream_id]
    );

    const results = [];
    for (const student of students) {
      const scores = await getStudentSubjectScore(student.id, subject_id, stream_id, term, academic_year);
      if (!scores.has_scores) continue;
      const g = await getGrade(scores.combined);
      results.push({
        student_id:     student.id,
        student_number: student.student_number,
        first_name:     student.first_name,
        last_name:      student.last_name,
        exam_score:     scores.exam_score,
        ca_score:       scores.ca_score,
        percentage:     scores.combined,
        grade:          g.grade,
        grade_label:    g.label,
      });
    }

    results.sort((a, b) => b.percentage - a.percentage);
    results.forEach((r, i) => { r.subject_position = i + 1; });
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET form-wide ranking
router.get('/form-ranking', async (req, res) => {
  try {
    const { form_level, academic_year, term } = req.query;
    if (!form_level) return res.status(400).json({ error: 'form_level is required' });

    const [streams] = await pool.query(
      'SELECT * FROM class_streams WHERE form_level=? AND academic_year=?',
      [form_level, academic_year || '2024/2025']
    );
    if (!streams.length) return res.status(404).json({ error: 'No streams found for this form level' });

    const allResults = [];
    for (const stream of streams) {
      const [students] = await pool.query(
        "SELECT * FROM students WHERE stream_id=? AND status='Active'", [stream.id]
      );
      const [streamSubjects] = await pool.query(
        'SELECT sub.id FROM subjects sub JOIN stream_subjects ss ON ss.subject_id=sub.id WHERE ss.stream_id=?',
        [stream.id]
      );
      for (const student of students) {
        let grandTotal = 0, subjectCount = 0;
        for (const subj of streamSubjects) {
          const sc = await getStudentSubjectScore(student.id, subj.id, stream.id, term, academic_year);
          if (sc.has_scores) { grandTotal += sc.combined; subjectCount++; }
        }
        const average   = subjectCount > 0 ? grandTotal / subjectCount : 0;
        const gradeInfo = await getGrade(average);
        allResults.push({
          student_id:     student.id,
          student_number: student.student_number,
          first_name:     student.first_name,
          last_name:      student.last_name,
          stream_name:    stream.name,
          total_points:   Math.round(grandTotal * 100) / 100,
          average:        Math.round(average    * 100) / 100,
          subjects_count: subjectCount,
          grade:          gradeInfo.grade,
          grade_label:    gradeInfo.label,
        });
      }
    }

    allResults.sort((a, b) => b.average - a.average);
    allResults.forEach((r, i) => { r.overall_position = i + 1; });
    res.json({
      form_level,
      streams: streams.map(s => s.name),
      results: allResults,
      total_students: allResults.length,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET grading scales
router.get('/grading-scales', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM grading_scales ORDER BY min_score DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
