import React, { useEffect, useState } from 'react';
import { getStudents, getStudentResults } from '../utils/api';

export default function Results() {
  const [students, setStudents]     = useState([]);
  const [search, setSearch]         = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selStudent, setSelStudent] = useState(null); // store full object
  const [term, setTerm]             = useState('Term 1');
  const [year, setYear]             = useState('2024/2025');
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => { getStudents().then(r => setStudents(Array.isArray(r.data) ? r.data : [])); }, []);

  const filtered = search.length >= 1
    ? students.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        s.student_number.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleSelect = (s) => {
    setSelStudent(s);
    setSearch(`${s.first_name} ${s.last_name} (${s.student_number})`);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSelStudent(null);
    setShowDropdown(true);
    setResults(null);
  };

  const handleLoad = () => {
    if (!selStudent) return;
    setLoading(true);
    getStudentResults(selStudent.id, { term, academic_year: year })
      .then(r => setResults(r.data))
      .finally(() => setLoading(false));
  };

  const getReportURL = () => {
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/reports/student/${selStudent.id}/html?term=${term}&academic_year=${year}`;
  };

  return (
    <>
      <div className="page-header">
        <h2>Student Results</h2>
        {results && selStudent && (
          <a className="btn btn-primary" href={selStudent ? getReportURL() : '#'} target="_blank" rel="noreferrer">📄 Print Report Card</a>
        )}
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-title">Search Student</div>
          <div className="form-grid">
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Student</label>
              <input
                className="form-control"
                placeholder="Type name or student number..."
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                autoComplete="off"
              />
              {showDropdown && search.length >= 1 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  border: '1px solid var(--border)', borderRadius: 6, background: 'white',
                  maxHeight: 200, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {filtered.length ? filtered.slice(0, 8).map(s => (
                    <div key={s.id}
                      style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}
                      onMouseDown={() => handleSelect(s)}>
                      <strong>{s.last_name}, {s.first_name}</strong>
                      <span style={{ color: '#6b7280', marginLeft: 8 }}>{s.student_number} — {s.stream_name}</span>
                    </div>
                  )) : (
                    <div style={{ padding: '9px 14px', color: '#999', fontSize: 13 }}>No students found</div>
                  )}
                </div>
              )}
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
          <button className="btn btn-primary" disabled={!selStudent || loading} onClick={handleLoad}>
            {loading ? 'Loading...' : '🔍 Load Results'}
          </button>
        </div>

        {results && (
          <div className="card">
            <div className="card-title">
              {results.student.first_name} {results.student.last_name} — {results.student.stream_name}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Subject</th><th>Code</th>
                    <th>Exam (70%)</th><th>CA (30%)</th>
                    <th>Combined /100</th><th>Grade</th><th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {results.subjects.map((s, i) => (
                    <tr key={s.subject_id}>
                      <td>{i + 1}</td>
                      <td>{s.subject_name}</td>
                      <td>{s.code}</td>
                      <td>{s.exam_score}</td>
                      <td>{s.ca_score}</td>
                      <td><strong>{s.combined}</strong></td>
                      <td><span className={`badge badge-${s.grade}`}>{s.grade}</span></td>
                      <td>{s.grade_label}</td>
                    </tr>
                  ))}
                  {!results.subjects.length && (
                    <tr><td colSpan={8} className="empty">No scores found for this term/year</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {results.subjects.length > 0 && (
              <div style={{ marginTop: 16, padding: '14px 16px', background: '#f0f4fa', borderRadius: 8, display: 'flex', gap: 32 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Total Points</div>
                  <strong>{results.summary.total_points}</strong>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Subjects</div>
                  <strong>{results.summary.total_subjects}</strong>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Average</div>
                  <strong>{results.summary.average}%</strong>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Overall Grade</div>
                  <strong><span className={`badge badge-${results.summary.grade}`}>{results.summary.grade} — {results.summary.grade_label}</span></strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
