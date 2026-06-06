const express = require('express');
const router  = express.Router();
const { pool } = require('../config/database');

async function getGrade(pool, score) {
  const [grades] = await pool.query(
    'SELECT * FROM grading_scales WHERE ? BETWEEN min_score AND max_score LIMIT 1',
    [score]
  );
  return grades.length ? grades[0] : { grade: 'U', label: 'Fail', points: 0 };
}

async function getStudentSubjectScore(pool, student_id, subject_id, stream_id, term, academic_year) {
  let query = `
    SELECT sc.score, a.max_score, a.type
    FROM scores sc
    JOIN assessments a ON a.id = sc.assessment_id
    WHERE sc.student_id = ? AND a.subject_id = ? AND a.stream_id = ?
  `;
  const params = [student_id, subject_id, stream_id];
  if (term)          { query += ' AND a.term = ?';          params.push(term); }
  if (academic_year) { query += ' AND a.academic_year = ?'; params.push(academic_year); }
  const [scores] = await pool.query(query, params);

  const examScores = scores.filter(s => s.type === 'Exam');
  const caScores   = scores.filter(s => ['CA','Quiz','Assignment'].includes(s.type));

  const examTotal    = examScores.reduce((s, r) => s + parseFloat(r.score), 0);
  const examMax      = examScores.reduce((s, r) => s + parseFloat(r.max_score), 0);
  const examWeighted = examMax > 0 ? (examTotal / examMax) * 70 : 0;

  const caTotal    = caScores.reduce((s, r) => s + parseFloat(r.score), 0);
  const caMax      = caScores.reduce((s, r) => s + parseFloat(r.max_score), 0);
  const caWeighted = caMax > 0 ? (caTotal / caMax) * 30 : 0;

  return {
    exam_score: Math.round(examWeighted * 100) / 100,
    ca_score:   Math.round(caWeighted   * 100) / 100,
    combined:   Math.round((examWeighted + caWeighted) * 100) / 100,
    has_scores: scores.length > 0,
  };
}

// ── Individual student report card ──────────────────────────
router.get('/student/:student_id/html', async (req, res) => {
  try {
    const { term, academic_year } = req.query;
    const { student_id } = req.params;

    const [students] = await pool.query(
      'SELECT s.*, cs.name AS stream_name, cs.id AS stream_id FROM students s JOIN class_streams cs ON cs.id = s.stream_id WHERE s.id = ?',
      [student_id]
    );
    if (!students.length) return res.status(404).json({ error: 'Student not found' });
    const student = students[0];

    const [streamSubjects] = await pool.query(`
      SELECT sub.id, sub.name, sub.code FROM subjects sub
      JOIN stream_subjects ss ON ss.subject_id = sub.id
      WHERE ss.stream_id = ?
    `, [student.stream_id]);

    const [classStudents] = await pool.query(
      'SELECT id FROM students WHERE stream_id = ? AND status = "Active"', [student.stream_id]
    );

    const classAverages = [];
    for (const cs of classStudents) {
      let total = 0, count = 0;
      for (const subj of streamSubjects) {
        const sc = await getStudentSubjectScore(pool, cs.id, subj.id, student.stream_id, term, academic_year);
        if (sc.has_scores) { total += sc.combined; count++; }
      }
      classAverages.push({ id: cs.id, avg: count > 0 ? total / count : 0 });
    }
    classAverages.sort((a, b) => b.avg - a.avg);
    const position = classAverages.findIndex(s => s.id === parseInt(student_id)) + 1;

    const subjectRows = [];
    let grandTotal = 0;
    for (const subj of streamSubjects) {
      const scores = await getStudentSubjectScore(pool, student_id, subj.id, student.stream_id, term, academic_year);
      if (!scores.has_scores) continue;
      const g = await getGrade(pool, scores.combined);
      subjectRows.push({ ...subj, ...scores, grade: g.grade, label: g.label });
      grandTotal += scores.combined;
    }

    const average      = subjectRows.length > 0 ? grandTotal / subjectRows.length : 0;
    const overallGrade = await getGrade(pool, average);

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:Arial,sans-serif; font-size:13px; color:#111; padding:30px; }
.header { text-align:center; border-bottom:3px solid #1a3c6e; padding-bottom:14px; margin-bottom:20px; }
.header h1 { font-size:24px; color:#1a3c6e; font-weight:800; }
.header h2 { font-size:14px; color:#555; margin-top:4px; }
.meta { display:flex; justify-content:space-between; margin-bottom:20px; background:#f7f9fc; padding:12px 16px; border-radius:6px; }
.meta-block div { margin-bottom:4px; }
.meta-block strong { color:#1a3c6e; }
table { width:100%; border-collapse:collapse; margin-bottom:20px; }
th { background:#1a3c6e; color:white; padding:9px 12px; text-align:left; font-size:12px; }
td { padding:8px 12px; border-bottom:1px solid #ddd; }
tr:nth-child(even) td { background:#f7f9fc; }
.grade-A{color:#1a7a3c;font-weight:bold} .grade-B{color:#2a6496;font-weight:bold}
.grade-C{color:#8a6d3b;font-weight:bold} .grade-D{color:#a94442}
.grade-E,.grade-U{color:#d9534f}
.summary { background:#f0f4fa; border:1px solid #b8cce4; border-radius:8px; padding:16px 20px; margin-bottom:24px; }
.summary h3 { color:#1a3c6e; margin-bottom:12px; font-size:14px; }
.summary-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
.summary-item { text-align:center; }
.summary-item .val { font-size:20px; font-weight:bold; color:#1a3c6e; }
.summary-item .lbl { font-size:11px; color:#666; margin-top:2px; }
.footer { margin-top:40px; display:flex; justify-content:space-between; }
.sig { border-top:1px solid #333; width:160px; text-align:center; padding-top:4px; font-size:11px; color:#555; }
@media print { body{padding:15px} }
</style></head><body>
<div class="header">
  <h1>IKONEX ACADEMY</h1>
  <h2>STUDENT REPORT CARD &mdash; ${term || 'All Terms'} ${academic_year || ''}</h2>
</div>
<div class="meta">
  <div class="meta-block">
    <div><strong>Full Name:</strong> ${student.first_name} ${student.last_name}</div>
    <div><strong>Student No:</strong> ${student.student_number}</div>
    <div><strong>Class:</strong> ${student.stream_name}</div>
  </div>
  <div class="meta-block">
    <div><strong>Date of Birth:</strong> ${student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</div>
    <div><strong>Gender:</strong> ${student.gender || 'N/A'}</div>
    <div><strong>Class Position:</strong> <strong style="color:#e8a020">${position} / ${classStudents.length}</strong></div>
  </div>
</div>
<table>
  <thead>
    <tr><th>#</th><th>Subject</th><th>Code</th><th>Exam (70%)</th><th>CA (30%)</th><th>Combined /100</th><th>Grade</th><th>Remark</th></tr>
  </thead>
  <tbody>
    ${subjectRows.map((s, i) => `
    <tr>
      <td>${i+1}</td><td>${s.name}</td><td>${s.code}</td>
      <td>${s.exam_score}</td><td>${s.ca_score}</td>
      <td><strong>${s.combined}</strong></td>
      <td class="grade-${s.grade}">${s.grade}</td>
      <td>${s.label}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="summary">
  <h3>Overall Performance Summary</h3>
  <div class="summary-grid">
    <div class="summary-item"><div class="val">${subjectRows.length}</div><div class="lbl">Subjects</div></div>
    <div class="summary-item"><div class="val">${grandTotal.toFixed(1)}</div><div class="lbl">Total Points</div></div>
    <div class="summary-item"><div class="val">${average.toFixed(1)}%</div><div class="lbl">Average</div></div>
    <div class="summary-item"><div class="val">${overallGrade.grade}</div><div class="lbl">Overall Grade</div></div>
    <div class="summary-item"><div class="val" style="color:#e8a020">${position}/${classStudents.length}</div><div class="lbl">Class Position</div></div>
  </div>
</div>
<div class="footer">
  <div class="sig">Class Teacher</div>
  <div class="sig">Head Teacher</div>
  <div class="sig">Parent/Guardian</div>
  <div class="sig">Date</div>
</div>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Class performance report ─────────────────────────────────
router.get('/class/:stream_id/html', async (req, res) => {
  try {
    const { stream_id } = req.params;
    const { term, academic_year } = req.query;

    const [stream]   = await pool.query('SELECT * FROM class_streams WHERE id = ?', [stream_id]);
    if (!stream.length) return res.status(404).json({ error: 'Stream not found' });

    const [students] = await pool.query(
      'SELECT * FROM students WHERE stream_id = ? AND status = "Active" ORDER BY last_name, first_name',
      [stream_id]
    );
    const [streamSubjects] = await pool.query(`
      SELECT sub.id, sub.name FROM subjects sub
      JOIN stream_subjects ss ON ss.subject_id = sub.id WHERE ss.stream_id = ?
    `, [stream_id]);

    const results = [];
    for (const student of students) {
      let grandTotal = 0, subjectCount = 0;
      for (const subj of streamSubjects) {
        const sc = await getStudentSubjectScore(pool, student.id, subj.id, stream_id, term, academic_year);
        if (sc.has_scores) { grandTotal += sc.combined; subjectCount++; }
      }
      const average   = subjectCount > 0 ? grandTotal / subjectCount : 0;
      const gradeInfo = await getGrade(pool, average);
      results.push({ ...student, average: average.toFixed(1), total: grandTotal.toFixed(1), grade: gradeInfo.grade, label: gradeInfo.label });
    }
    results.sort((a, b) => b.average - a.average);

    const classAvg = results.length
      ? (results.reduce((s, r) => s + parseFloat(r.average), 0) / results.length).toFixed(1)
      : 0;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:Arial,sans-serif; font-size:13px; padding:30px; }
.header { text-align:center; border-bottom:3px solid #1a3c6e; padding-bottom:14px; margin-bottom:20px; }
h1 { font-size:22px; color:#1a3c6e; font-weight:800; }
h2 { font-size:14px; color:#555; margin-top:4px; }
.stats { display:flex; gap:20px; margin-bottom:20px; }
.stat { background:#f0f4fa; border-radius:6px; padding:10px 20px; text-align:center; }
.stat .v { font-size:20px; font-weight:bold; color:#1a3c6e; }
.stat .l { font-size:11px; color:#666; }
table { width:100%; border-collapse:collapse; }
th { background:#1a3c6e; color:#fff; padding:9px 12px; text-align:left; }
td { padding:8px 12px; border-bottom:1px solid #ddd; }
tr:nth-child(even) td { background:#f7f9fc; }
.grade-A{color:#1a7a3c;font-weight:bold} .grade-B{color:#2a6496;font-weight:bold}
.grade-C{color:#8a6d3b;font-weight:bold} .grade-D,.grade-E,.grade-U{color:#d9534f}
@media print { body{padding:15px} }
</style></head><body>
<div class="header">
  <h1>IKONEX ACADEMY</h1>
  <h2>CLASS PERFORMANCE REPORT &mdash; ${stream[0].name} | ${term || 'All Terms'} ${academic_year || ''}</h2>
</div>
<div class="stats">
  <div class="stat"><div class="v">${results.length}</div><div class="l">Students</div></div>
  <div class="stat"><div class="v">${classAvg}%</div><div class="l">Class Average</div></div>
  <div class="stat"><div class="v">${results.filter(r => parseFloat(r.average) >= 50).length}</div><div class="l">Passing</div></div>
  <div class="stat"><div class="v">${results.filter(r => r.grade === 'A').length}</div><div class="l">Distinctions</div></div>
</div>
<table><thead><tr>
  <th>Pos</th><th>Student No</th><th>Name</th><th>Total Points</th><th>Average %</th><th>Grade</th><th>Remark</th>
</tr></thead><tbody>
${results.map((s, i) => `<tr>
  <td><strong>${i+1}</strong></td>
  <td>${s.student_number}</td>
  <td>${s.last_name}, ${s.first_name}</td>
  <td>${s.total}</td>
  <td><strong>${s.average}%</strong></td>
  <td class="grade-${s.grade}">${s.grade}</td>
  <td>${s.label}</td>
</tr>`).join('')}
</tbody></table>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Subject performance report ───────────────────────────────
router.get('/subject/:subject_id/stream/:stream_id/html', async (req, res) => {
  try {
    const { subject_id, stream_id } = req.params;
    const { term, academic_year }   = req.query;

    const [[stream]]  = await pool.query('SELECT * FROM class_streams WHERE id = ?', [stream_id]);
    const [[subject]] = await pool.query('SELECT * FROM subjects WHERE id = ?', [subject_id]);

    const [students] = await pool.query(
      'SELECT * FROM students WHERE stream_id = ? AND status = "Active" ORDER BY last_name, first_name',
      [stream_id]
    );

    const results = [];
    for (const student of students) {
      const sc = await getStudentSubjectScore(pool, student.id, subject_id, stream_id, term, academic_year);
      if (!sc.has_scores) continue;
      const g = await getGrade(pool, sc.combined);
      results.push({ ...student, ...sc, grade: g.grade, label: g.label });
    }
    results.sort((a, b) => b.combined - a.combined);

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:Arial,sans-serif; font-size:13px; padding:30px; }
.header { text-align:center; border-bottom:3px solid #1a3c6e; padding-bottom:14px; margin-bottom:20px; }
h1 { font-size:22px; color:#1a3c6e; font-weight:800; }
h2 { font-size:14px; color:#555; margin-top:4px; }
table { width:100%; border-collapse:collapse; }
th { background:#1a3c6e; color:#fff; padding:9px 12px; text-align:left; }
td { padding:8px 12px; border-bottom:1px solid #ddd; }
tr:nth-child(even) td { background:#f7f9fc; }
.grade-A{color:#1a7a3c;font-weight:bold} .grade-B{color:#2a6496;font-weight:bold}
.grade-C{color:#8a6d3b;font-weight:bold} .grade-D,.grade-E,.grade-U{color:#d9534f}
@media print { body{padding:15px} }
</style></head><body>
<div class="header">
  <h1>IKONEX ACADEMY</h1>
  <h2>SUBJECT PERFORMANCE &mdash; ${subject?.name} | ${stream?.name} | ${term || ''} ${academic_year || ''}</h2>
</div>
<table><thead><tr>
  <th>Pos</th><th>Student No</th><th>Name</th><th>Exam (70%)</th><th>CA (30%)</th><th>Combined /100</th><th>Grade</th><th>Remark</th>
</tr></thead><tbody>
${results.map((s, i) => `<tr>
  <td>${i+1}</td><td>${s.student_number}</td>
  <td>${s.last_name}, ${s.first_name}</td>
  <td>${s.exam_score}</td><td>${s.ca_score}</td>
  <td><strong>${s.combined}</strong></td>
  <td class="grade-${s.grade}">${s.grade}</td>
  <td>${s.label}</td>
</tr>`).join('')}
</tbody></table>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Form-wide ranking report ─────────────────────────────────
router.get('/form-ranking/html', async (req, res) => {
  try {
    const { form_level, term, academic_year } = req.query;
    if (!form_level) return res.status(400).json({ error: 'form_level is required' });

    const [streams] = await pool.query(
      'SELECT * FROM class_streams WHERE form_level = ? AND academic_year = ?',
      [form_level, academic_year || '2024/2025']
    );

    const allResults = [];
    for (const stream of streams) {
      const [students] = await pool.query(
        'SELECT * FROM students WHERE stream_id = ? AND status = "Active"', [stream.id]
      );
      const [streamSubjects] = await pool.query(`
        SELECT sub.id FROM subjects sub
        JOIN stream_subjects ss ON ss.subject_id = sub.id WHERE ss.stream_id = ?
      `, [stream.id]);

      for (const student of students) {
        let grandTotal = 0, subjectCount = 0;
        for (const subj of streamSubjects) {
          const sc = await getStudentSubjectScore(pool, student.id, subj.id, stream.id, term, academic_year);
          if (sc.has_scores) { grandTotal += sc.combined; subjectCount++; }
        }
        const average   = subjectCount > 0 ? grandTotal / subjectCount : 0;
        const gradeInfo = await getGrade(pool, average);
        allResults.push({
          student_number: student.student_number,
          first_name:     student.first_name,
          last_name:      student.last_name,
          stream_name:    stream.name,
          total_points:   grandTotal.toFixed(1),
          average:        average.toFixed(1),
          grade:          gradeInfo.grade,
          label:          gradeInfo.label,
        });
      }
    }

    allResults.sort((a, b) => b.average - a.average);
    const classAvg = allResults.length
      ? (allResults.reduce((s, r) => s + parseFloat(r.average), 0) / allResults.length).toFixed(1)
      : 0;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:Arial,sans-serif; font-size:13px; padding:30px; }
.header { text-align:center; border-bottom:3px solid #1a3c6e; padding-bottom:14px; margin-bottom:20px; }
h1 { font-size:22px; color:#1a3c6e; font-weight:800; }
h2 { font-size:14px; color:#555; margin-top:4px; }
.stats { display:flex; gap:20px; margin-bottom:20px; flex-wrap:wrap; }
.stat { background:#f0f4fa; border-radius:6px; padding:10px 20px; text-align:center; }
.stat .v { font-size:20px; font-weight:bold; color:#1a3c6e; }
.stat .l { font-size:11px; color:#666; }
table { width:100%; border-collapse:collapse; }
th { background:#1a3c6e; color:#fff; padding:9px 12px; text-align:left; }
td { padding:8px 12px; border-bottom:1px solid #ddd; }
tr:nth-child(even) td { background:#f7f9fc; }
.grade-A{color:#1a7a3c;font-weight:bold} .grade-B{color:#2a6496;font-weight:bold}
.grade-C{color:#8a6d3b;font-weight:bold} .grade-D,.grade-E,.grade-U{color:#d9534f}
@media print { body{padding:15px} }
</style></head><body>
<div class="header">
  <h1>IKONEX ACADEMY</h1>
  <h2>FORM ${form_level} OVERALL RANKINGS &mdash; ${streams.map(s => s.name).join(', ')} | ${term || ''} ${academic_year || ''}</h2>
</div>
<div class="stats">
  <div class="stat"><div class="v">${allResults.length}</div><div class="l">Total Students</div></div>
  <div class="stat"><div class="v">${streams.length}</div><div class="l">Streams</div></div>
  <div class="stat"><div class="v">${classAvg}%</div><div class="l">Overall Average</div></div>
  <div class="stat"><div class="v">${allResults.filter(r => parseFloat(r.average) >= 50).length}</div><div class="l">Passing</div></div>
</div>
<table><thead><tr>
  <th>Pos</th><th>Student No</th><th>Name</th><th>Stream</th><th>Total Points</th><th>Average %</th><th>Grade</th><th>Remark</th>
</tr></thead><tbody>
${allResults.map((s, i) => `<tr>
  <td><strong>${i+1}</strong></td>
  <td>${s.student_number}</td>
  <td>${s.last_name}, ${s.first_name}</td>
  <td>${s.stream_name}</td>
  <td>${s.total_points}</td>
  <td><strong>${s.average}%</strong></td>
  <td class="grade-${s.grade}">${s.grade}</td>
  <td>${s.label}</td>
</tr>`).join('')}
</tbody></table>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;