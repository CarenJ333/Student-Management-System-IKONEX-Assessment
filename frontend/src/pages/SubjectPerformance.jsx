import React, { useEffect, useState } from 'react';
import { getStreams, getSubjects, getSubjectResults } from '../utils/api';

export default function SubjectPerformance() {
  const [streams, setStreams]       = useState([]);
  const [subjects, setSubjects]     = useState([]);
  const [selStream, setSelStream]   = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [term, setTerm]             = useState('Term 1');
  const [year, setYear]             = useState('2024/2025');
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    Promise.all([
      getStreams().then(r  => setStreams(Array.isArray(r.data)  ? r.data  : [])),
      getSubjects().then(r => setSubjects(Array.isArray(r.data) ? r.data : [])),
    ]);
  }, []);

  const handleLoad = () => {
    if (!selStream || !selSubject) return;
    setLoading(true);
    getSubjectResults(selSubject, selStream, { term, academic_year: year })
      .then(r => setResults(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  };

  const openReport = () => {
    const url = `/api/reports/subject/${selSubject}/stream/${selStream}/html?term=${term}&academic_year=${year}`;
    const win = window.open(url, '_blank');
    win.onload = () => { win.print(); };
  };

  const streamName  = streams.find(s  => String(s.id) === String(selStream))?.name  || '';
  const subjectName = subjects.find(s => String(s.id) === String(selSubject))?.name || '';

  const gradeColor = (g) => ({ A:'#1a7a3c', B:'#2a6496', C:'#8a6d3b', D:'#a94442', E:'#d9534f', U:'#d9534f' }[g] || '#333');

  const avg     = results?.length ? (results.reduce((s,r) => s + parseFloat(r.percentage), 0) / results.length).toFixed(1) : null;
  const highest = results?.length ? Math.max(...results.map(r => parseFloat(r.percentage))).toFixed(1) : null;
  const lowest  = results?.length ? Math.min(...results.map(r => parseFloat(r.percentage))).toFixed(1) : null;
  const passing = results?.length ? results.filter(r => parseFloat(r.percentage) >= 50).length : null;

  return (
    <>
      <div className="page-header">
        <h2>Subject Performance</h2>
        {results?.length > 0 && (
          <button className="btn btn-primary" onClick={openReport}>📄 Print as PDF</button>
        )}
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-title">Select Class &amp; Subject</div>
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
          <button className="btn btn-primary" disabled={!selStream || !selSubject || loading} onClick={handleLoad}>
            {loading ? 'Loading...' : '📊 Load Performance'}
          </button>
        </div>

        {results && (
          <>
            {results.length > 0 && (
              <div className="stat-grid">
                <div className="stat-card" style={{ borderTop: '4px solid #1a3c6e' }}>
                  <div className="value">{results.length}</div><div className="label">Students</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #1a7a3c' }}>
                  <div className="value">{avg}%</div><div className="label">Class Average</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #2a5ba8' }}>
                  <div className="value">{highest}%</div><div className="label">Highest Score</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #d9534f' }}>
                  <div className="value">{lowest}%</div><div className="label">Lowest Score</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #e8a020' }}>
                  <div className="value">{passing}/{results.length}</div><div className="label">Passing (≥50%)</div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-title">{subjectName} — {streamName} | {term} {year}</div>
              {results.length ? (
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
                      {results.map(r => (
                        <tr key={r.student_id}>
                          <td>
                            <strong style={{ color: r.subject_position <= 3 ? '#e8a020' : '#333' }}>
                              {r.subject_position <= 3 ? ['🥇','🥈','🥉'][r.subject_position - 1] : ''}
                              #{r.subject_position}
                            </strong>
                          </td>
                          <td>{r.student_number}</td>
                          <td>{r.last_name}, {r.first_name}</td>
                          <td>{r.exam_score}</td>
                          <td>{r.ca_score}</td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{
                                width: Math.min(r.percentage, 100) * 0.8,
                                height: 6, background: gradeColor(r.grade),
                                borderRadius: 3, minWidth: 4
                              }}/>
                              <strong>{r.percentage}%</strong>
                            </div>
                          </td>
                          <td><span style={{ color: gradeColor(r.grade), fontWeight:600 }}>{r.grade}</span></td>
                          <td style={{ color:'#6b7280' }}>{r.grade_label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty">No scores found for this subject, stream and term.</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}