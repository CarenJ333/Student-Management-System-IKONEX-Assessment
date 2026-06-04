import React, { useEffect, useState } from 'react';
import { getStudents, getStudentResults } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Results() {
  const [students, setStudents] = useState([]);
  const [search, setSearch]     = useState('');
  const [selStudent, setSelStudent] = useState('');
  const [term, setTerm]         = useState('Term 1');
  const [year, setYear]         = useState('2024/2025');
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => { getStudents().then(r => setStudents(Array.isArray(r.data) ? r.data : [])); }, []);

  const filtered = search
    ? students.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        s.student_number.toLowerCase().includes(search.toLowerCase()))
    : students;

  const handleLoad = () => {
    if (!selStudent) return;
    setLoading(true);
    getStudentResults(selStudent, { term, academic_year: year })
      .then(r => setResults(r.data))
      .finally(() => setLoading(false));
  };

  const openReport = () => {
    window.open(`/api/reports/student/${selStudent}/html?term=${term}&academic_year=${year}`, '_blank');
  };

  return (
    <>
      <div className="page-header">
        <h2>Student Results</h2>
        {results && selStudent && (
          <button className="btn btn-primary" onClick={openReport}>📄 Print Report Card</button>
        )}
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-title">Search Student</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Student</label>
              <input className="form-control" placeholder="Search by name or number..."
                value={search} onChange={e => { setSearch(e.target.value); setSelStudent(''); }} />
              {search && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 6, marginTop: 4, maxHeight: 200, overflowY: 'auto', background: 'white' }}>
                  {filtered.slice(0, 10).map(s => (
                    <div key={s.id}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                      onClick={() => { setSelStudent(s.id); setSearch(`${s.first_name} ${s.last_name} (${s.student_number})`); }}>
                      {s.last_name}, {s.first_name} — {s.student_number} | {s.stream_name}
                    </div>
                  ))}
                  {!filtered.length && <div style={{ padding: '8px 12px', color: '#999' }}>No students found</div>}
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
          <>
            <div className="card">
              <div className="card-title">
                {results.student.first_name} {results.student.last_name} — {results.student.stream_name}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>#</th><th>Subject</th><th>Code</th><th>Total</th><th>Max</th><th>%</th><th>Grade</th><th>Remark</th></tr>
                  </thead>
                  <tbody>
                    {results.subjects.map((s, i) => (
                      <tr key={s.subject_id}>
                        <td>{i + 1}</td>
                        <td>{s.subject_name}</td>
                        <td>{s.code}</td>
                        <td>{parseFloat(s.total).toFixed(1)}</td>
                        <td>{s.max_total}</td>
                        <td>{s.percentage}%</td>
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
                  <div><div style={{ fontSize: 11, color: '#6b7280' }}>Total Marks</div><strong>{results.summary.total_marks} / {results.summary.max_marks}</strong></div>
                  <div><div style={{ fontSize: 11, color: '#6b7280' }}>Average</div><strong>{results.summary.average}%</strong></div>
                  <div><div style={{ fontSize: 11, color: '#6b7280' }}>Overall Grade</div><strong><span className={`badge badge-${results.summary.grade}`}>{results.summary.grade} — {results.summary.grade_label}</span></strong></div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
