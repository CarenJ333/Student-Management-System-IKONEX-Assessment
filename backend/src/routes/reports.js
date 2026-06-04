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

// Generate HTML report card for a student (returns HTML to be printed as PDF client-side)
router.get('/student/:student_id/html', async (req, res) => {
  try {
    const { term, academic_year } = req.query;
    const { student_id } = req.params;

    const [students] = await pool.query(
      'SELECT s.*, cs.name AS stream_name FROM students s JOIN class_streams cs ON cs.id = s.stream_id WHERE s.id = ?',
      [student_id]
    );
    if (!students.length) return res.status(404).json({ error: 'Student not found' });
    const student = students[0];

    let scoreQuery = `
      SELECT sc.score, a.max_score, a.name AS assessment_name, a.type,
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

    const subjectMap = {};
    for (const row of scores) {
      if (!subjectMap[row.subject_id]) {
        subjectMap[row.subject_id] = { name: row.subject_name, code: row.code, total: 0, max: 0 };
      }
      subjectMap[row.subject_id].total += parseFloat(row.score);
      subjectMap[row.subject_id].max   += parseFloat(row.max_score);
    }

    let grandTotal = 0, grandMax = 0;
    const subjectRows = [];
    for (const [sid, subj] of Object.entries(subjectMap)) {
      const pct = subj.max > 0 ? (subj.total / subj.max) * 100 : 0;
      const g = await getGrade(pool, pct);
      subjectRows.push({ ...subj, percentage: pct.toFixed(1), grade: g.grade, label: g.label });
      grandTotal += subj.total;
      grandMax   += subj.max;
    }

    const overallPct = grandMax > 0 ? (grandTotal / grandMax) * 100 : 0;
    const overallGrade = await getGrade(pool, overallPct);

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 30px; }
  .header { text-align:center; border-bottom: 3px solid #1a3c6e; padding-bottom: 12px; margin-bottom: 20px; }
  .header h1 { font-size: 22px; color: #1a3c6e; }
  .header h2 { font-size: 16px; color: #555; margin-top: 4px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
  .meta-block { line-height: 1.7; }
  .meta-block strong { color: #1a3c6e; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #1a3c6e; color: white; padding: 8px 10px; text-align: left; font-size: 12px; }
  td { padding: 7px 10px; border-bottom: 1px solid #ddd; }
  tr:nth-child(even) td { background: #f7f9fc; }
  .grade-A { color: #1a7a3c; font-weight: bold; }
  .grade-B { color: #2a6496; font-weight: bold; }
  .grade-C { color: #8a6d3b; font-weight: bold; }
  .grade-D { color: #a94442; }
  .grade-E, .grade-U { color: #d9534f; }
  .summary { background: #f0f4fa; border: 1px solid #b8cce4; border-radius: 6px; padding: 16px 20px; }
  .summary h3 { color: #1a3c6e; margin-bottom: 10px; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .summary-item { text-align: center; }
  .summary-item .value { font-size: 20px; font-weight: bold; color: #1a3c6e; }
  .summary-item .label { font-size: 11px; color: #666; }
  .footer { margin-top: 40px; display: flex; justify-content: space-between; }
  .sig-line { border-top: 1px solid #333; width: 180px; text-align: center; padding-top: 4px; font-size: 11px; color: #555; }
  @media print { body { padding: 15px; } }
</style>
</head>
<body>
<div class="header">
  <h1>Ikonex Academy</h1>
  <h2>Student Report Card — ${term || 'All Terms'} ${academic_year || ''}</h2>
</div>
<div class="meta">
  <div class="meta-block">
    <div><strong>Name:</strong> ${student.first_name} ${student.last_name}</div>
    <div><strong>Student No:</strong> ${student.student_number}</div>
    <div><strong>Class:</strong> ${student.stream_name}</div>
  </div>
  <div class="meta-block">
    <div><strong>Date of Birth:</strong> ${student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</div>
    <div><strong>Gender:</strong> ${student.gender || 'N/A'}</div>
    <div><strong>Status:</strong> ${student.status}</div>
  </div>
</div>
<table>
  <thead>
    <tr>
      <th>#</th><th>Subject</th><th>Code</th>
      <th>Total</th><th>Max</th><th>%</th><th>Grade</th><th>Remark</th>
    </tr>
  </thead>
  <tbody>
    ${subjectRows.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.name}</td>
      <td>${s.code}</td>
      <td>${s.total.toFixed(1)}</td>
      <td>${s.max}</td>
      <td>${s.percentage}%</td>
      <td class="grade-${s.grade}">${s.grade}</td>
      <td>${s.label}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="summary">
  <h3>Overall Performance Summary</h3>
  <div class="summary-grid">
    <div class="summary-item"><div class="value">${grandTotal.toFixed(1)}</div><div class="label">Total Marks</div></div>
    <div class="summary-item"><div class="value">${grandMax}</div><div class="label">Max Marks</div></div>
    <div class="summary-item"><div class="value">${overallPct.toFixed(1)}%</div><div class="label">Average</div></div>
    <div class="summary-item"><div class="value grade-${overallGrade.grade}">${overallGrade.grade}</div><div class="label">Overall Grade</div></div>
  </div>
</div>
<div class="footer">
  <div class="sig-line">Class Teacher</div>
  <div class="sig-line">Head Teacher</div>
  <div class="sig-line">Date</div>
</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate class performance HTML report
router.get('/class/:stream_id/html', async (req, res) => {
  try {
    const { stream_id } = req.params;
    const { term, academic_year } = req.query;

    const [stream] = await pool.query('SELECT * FROM class_streams WHERE id = ?', [stream_id]);
    if (!stream.length) return res.status(404).json({ error: 'Stream not found' });

    const [students] = await pool.query(
      'SELECT * FROM students WHERE stream_id = ? AND status = "Active" ORDER BY last_name, first_name',
      [stream_id]
    );

    const results = [];
    for (const student of students) {
      let q = `SELECT SUM(sc.score) AS total, SUM(a.max_score) AS max_total
               FROM scores sc JOIN assessments a ON a.id = sc.assessment_id
               WHERE sc.student_id = ? AND a.stream_id = ?`;
      const params = [student.id, stream_id];
      if (term)          { q += ' AND a.term = ?';         params.push(term); }
      if (academic_year) { q += ' AND a.academic_year = ?';params.push(academic_year); }
      const [[row]] = await pool.query(q, params);
      const total = parseFloat(row.total || 0);
      const max   = parseFloat(row.max_total || 0);
      const avg   = max > 0 ? (total / max) * 100 : 0;
      const g     = await getGrade(pool, avg);
      results.push({ ...student, total, max, average: avg.toFixed(1), grade: g.grade, label: g.label });
    }
    results.sort((a, b) => b.average - a.average);

    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; padding: 30px; }
  h1 { color: #1a3c6e; text-align: center; }
  h2 { color: #555; text-align: center; margin-bottom: 20px; font-size:14px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#1a3c6e; color:#fff; padding:8px 10px; text-align:left; }
  td { padding:7px 10px; border-bottom:1px solid #ddd; }
  tr:nth-child(even) td { background:#f7f9fc; }
  .grade-A{color:#1a7a3c;font-weight:bold} .grade-B{color:#2a6496;font-weight:bold}
  .grade-C{color:#8a6d3b;font-weight:bold} .grade-D,.grade-E,.grade-U{color:#d9534f}
  @media print { body{padding:15px} }
</style></head><body>
<h1>Ikonex Academy</h1>
<h2>Class Performance Report — ${stream[0].name} | ${term || 'All Terms'} ${academic_year || ''}</h2>
<table><thead><tr>
  <th>Pos</th><th>Student No</th><th>Name</th><th>Total</th><th>Max</th><th>Average %</th><th>Grade</th><th>Remark</th>
</tr></thead><tbody>
${results.map((s, i) => `<tr>
  <td>${i + 1}</td>
  <td>${s.student_number}</td>
  <td>${s.last_name}, ${s.first_name}</td>
  <td>${s.total.toFixed(1)}</td>
  <td>${s.max}</td>
  <td>${s.average}%</td>
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
