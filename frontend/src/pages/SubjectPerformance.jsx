import React, { useEffect, useState } from 'react';
import { getStreams, getSubjects, getSubjectResults, getStudents, getStudentResults } from '../utils/api';

export default function SubjectPerformance() {
  const [streams, setStreams]         = useState([]);
  const [subjects, setSubjects]       = useState([]);
  const [students, setStudents]       = useState([]);

  // Class view filters
  const [selStream, setSelStream]     = useState('');
  const [selSubject, setSelSubject]   = useState('');
  const [term, setTerm]               = useState('Term 1');
  const [year, setYear]               = useState('2024/2025');
  const [classResults, setClassResults] = useState(null);

  // Individual student view
  const [search, setSearch]           = useState('');
  const [showDrop, setShowDrop]       = useState(false);
  const [selStudent, setSelStudent]   = useState(null);
  const [selStudentSubject, setSelStudentSubject] = useState('');
  const [studentResult, setStudentResult] = useState(null);

  const [loading, setLoading]         = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getStreams().then(r  => setStreams(Array.isArray(r.data)  ? r.data  : [])),
      getSubjects().then(r => setSubjects(Array.isArray(r.data) ? r.data : [])),
      getStudents().then(r => setStudents(Array.isArray(r.data) ? r.data : [])),
    ]);
  }, []);

  // ── Class subject view ─────────────────────────────────────
  const handleLoadClass = () => {
    if (!selStream || !selSubject) return;
    setLoading(true);
    getSubjectResults(selSubject, selStream, { term, academic_year: year })
      .then(r => setClassResults(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  };

  const openClassReport = () => {
    window.open(`${import.meta.env.VITE_API_URL || '/api'}/reports/subject/${selSubject}/stream/${selStream}/html?term=${term}&academic_year=${year}`, '_blank');
  };

  // ── Individual student subject view ────────────────────────
  const filteredStudents = search.length >= 1
    ? students.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        s.student_number.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleSelectStudent = (s) => {
    setSelStudent(s);
    setSearch(`${s.first_name} ${s.last_name} (${s.student_number})`);
    setShowDrop(false);
    setStudentResult(null);
    setSelStudentSubject('');
  };

  const handleLoadStudentSubject = () => {
    if (!selStudent || !selStudentSubject) return;
    setStudentLoading(true);
    getStudentResults(selStudent.id, {
      term,
      academic_year: year,
      subject_id: selStudentSubject
    }).then(r => setStudentResult(r.data))
      .finally(() => setStudentLoading(false));
  };

  const gradeColor = (g) => {
    const map = { A:'#1a7a3c', B:'#2a6496', C:'#8a6d3b', D:'#a94442', E:'#d9534f', U:'#d9534f' };
    return map[g] || '#333';
  };

  const streamName  = streams.find(s  => String(s.id) === String(selStream))?.name  || '';
  const subjectName = subjects.find(s => String(s.id) === String(selSubject))?.name || '';
  const studentSubjectName = subjects.find(s => String(s.id) === String(selStudentSubject))?.name || '';

  const avg     = classResults?.length ? (classResults.reduce((s,r) => s + parseFloat(r.percentage), 0) / classResults.length).toFixed(1) : null;
  const highest = classResults?.length ? Math.max(...classResults.map(r => parseFloat(r.percentage))).toFixed(1) : null;
  const lowest  = classResults?.length ? Math.min(...classResults.map(r => parseFloat(r.percentage))).toFixed(1) : null;
  const passing = classResults?.length ? classResults.filter(r => parseFloat(r.percentage) >= 50).length : null;

  const subjectResult = studentResult?.subjects?.[0];

  return (
    <>
      <div className="page-header">
        <h2>Subject Performance</h2>
        {classResults?.length > 0 && (
          <button className="btn btn-primary" onClick={openClassReport}>📄 Print Subject Report</button>
        )}
      </div>
      <div className="page-body">

        {/* ── SECTION 1: Individual student + subject ── */}
        <div className="card">
          <div className="card-title">🔍 Individual Student Performance by Subject</div>
          <p style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>
            Pick a student and a subject to see exactly how they performed in that subject.
          </p>
          <div className="form-grid">
            <div className="form-group" style={{ position:'relative' }}>
              <label className="form-label">Student</label>
              <input
                className="form-control"
                placeholder="Type name or student number..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelStudent(null); setShowDrop(true); setStudentResult(null); }}
                onFocus={() => setShowDrop(true)}
                onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                autoComplete="off"
              />
              {showDrop && search.length >= 1 && (
                <div style={{
                  position:'absolute', top:'100%', left:0, right:0, zIndex:50,
                  border:'1px solid var(--border)', borderRadius:6, background:'white',
                  maxHeight:200, overflowY:'auto', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {filteredStudents.length ? filteredStudents.slice(0,8).map(s => (
                    <div key={s.id}
                      style={{ padding:'9px 14px', cursor:'pointer', borderBottom:'1px solid #f0f0f0', fontSize:13 }}
                      onMouseDown={() => handleSelectStudent(s)}>
                      <strong>{s.last_name}, {s.first_name}</strong>
                      <span style={{ color:'#6b7280', marginLeft:8 }}>{s.student_number} — {s.stream_name}</span>
                    </div>
                  )) : (
                    <div style={{ padding:'9px 14px', color:'#999', fontSize:13 }}>No students found</div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-control" value={selStudentSubject}
                onChange={e => { setSelStudentSubject(e.target.value); setStudentResult(null); }}>
                <option value="">Choose subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Term</label>
              <select className="form-control" value={term} onChange={e => setTerm(e.target.value)}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input className="form-control" value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </div>

          <button className="btn btn-primary"
            disabled={!selStudent || !selStudentSubject || studentLoading}
            onClick={handleLoadStudentSubject}>
            {studentLoading ? 'Loading...' : '📊 View Student Subject Performance'}
          </button>

          {/* Student subject result */}
          {studentResult && subjectResult && (
            <div style={{ marginTop:20, background:'#f7f9ff', border:'1px solid #b8cce4', borderRadius:8, padding:20 }}>
              <div style={{ fontWeight:600, fontSize:15, color:'var(--primary)', marginBottom:16 }}>
                {selStudent?.first_name} {selStudent?.last_name} — {studentSubjectName}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px,1fr))', gap:12, marginBottom:16 }}>
                {[
                  { label:'Exam Score (70%)', value: subjectResult.exam_score, color:'#1a3c6e' },
                  { label:'CA Score (30%)',   value: subjectResult.ca_score,   color:'#2a5ba8' },
                  { label:'Combined /100',    value: subjectResult.combined,   color:'#1a7a3c' },
                  { label:'Grade',            value: subjectResult.grade,      color: gradeColor(subjectResult.grade) },
                  { label:'Subject Position', value: studentResult.subject_position
                      ? `#${studentResult.subject_position.position} / ${studentResult.subject_position.out_of}`
                      : '—',
                    color:'#e8a020' },
                ].map(item => (
                  <div key={item.label} style={{ background:'white', borderRadius:6, padding:'12px 16px', textAlign:'center',
                    border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:22, fontWeight:700, color:item.color }}>{item.value}</div>
                    <div style={{ fontSize:11, color:'#6b7280', marginTop:4 }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:13, color:'#6b7280' }}>
                Remark: <strong style={{ color: gradeColor(subjectResult.grade) }}>{subjectResult.grade_label}</strong>
              </div>
            </div>
          )}

          {studentResult && !subjectResult && (
            <div style={{ marginTop:16 }} className="empty">
              No scores found for {selStudent?.first_name} in {studentSubjectName} for {term} {year}.
            </div>
          )}
        </div>

        {/* ── SECTION 2: Class subject performance ── */}
        <div className="card">
          <div className="card-title">📈 Class Performance for a Selected Subject</div>
          <p style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>
            See how all students in a class performed in one subject, ranked by score.
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Class Stream</label>
              <select className="form-control" value={selStream} onChange={e => setSelStream(e.target.value)}>
                <option value="">Choose stream...</option>
                {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-control" value={selSubject} onChange={e => setSelSubject(e.target.value)}>
                <option value="">Choose subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-outline" disabled={!selStream || !selSubject || loading} onClick={handleLoadClass}>
            {loading ? 'Loading...' : '📊 Load Class Subject Performance'}
          </button>

          {classResults && (
            <>
              {classResults.length > 0 && (
                <div className="stat-grid" style={{ marginTop:16 }}>
                  <div className="stat-card" style={{ borderTop:'4px solid #1a3c6e' }}>
                    <div className="value">{classResults.length}</div><div className="label">Students</div>
                  </div>
                  <div className="stat-card" style={{ borderTop:'4px solid #1a7a3c' }}>
                    <div className="value">{avg}%</div><div className="label">Class Average</div>
                  </div>
                  <div className="stat-card" style={{ borderTop:'4px solid #2a5ba8' }}>
                    <div className="value">{highest}%</div><div className="label">Highest</div>
                  </div>
                  <div className="stat-card" style={{ borderTop:'4px solid #d9534f' }}>
                    <div className="value">{lowest}%</div><div className="label">Lowest</div>
                  </div>
                  <div className="stat-card" style={{ borderTop:'4px solid #e8a020' }}>
                    <div className="value">{passing}/{classResults.length}</div><div className="label">Passing</div>
                  </div>
                </div>
              )}

              <div style={{ marginTop:16 }} className="card-title">
                {subjectName} — {streamName} | {term} {year}
              </div>
              {classResults.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Position</th><th>Student No</th><th>Name</th>
                        <th>Exam /70</th><th>CA /30</th><th>Combined /100</th>
                        <th>Grade</th><th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classResults.map(r => (
                        <tr key={r.student_id}>
                          <td>
                            <strong style={{ color: r.subject_position <= 3 ? '#e8a020' : '#333' }}>
                              {r.subject_position <= 3 ? ['🥇','🥈','🥉'][r.subject_position - 1] + ' ' : ''}
                              #{r.subject_position}
                            </strong>
                          </td>
                          <td>{r.student_number}</td>
                          <td>{r.last_name}, {r.first_name}</td>
                          <td>{r.exam_score}</td>
                          <td>{r.ca_score}</td>
                          <td><strong>{r.percentage}</strong></td>
                          <td><span style={{ color: gradeColor(r.grade), fontWeight:600 }}>{r.grade}</span></td>
                          <td style={{ color:'#6b7280' }}>{r.grade_label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty">No scores found for this subject in this stream and term.</div>
              )}
            </>
          )}
        </div>

      </div>
    </>
  );
}
