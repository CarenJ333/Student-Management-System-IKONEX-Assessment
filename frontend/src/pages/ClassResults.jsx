import React, { useEffect, useState } from 'react';
import { getStreams, getClassResults } from '../utils/api';

export default function ClassResults() {
  const [streams, setStreams]   = useState([]);
  const [selStream, setSelStream] = useState('');
  const [term, setTerm]         = useState('Term 1');
  const [year, setYear]         = useState('2024/2025');
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { getStreams().then(r => setStreams(Array.isArray(r.data) ? r.data : [])); }, []);

  const handleLoad = () => {
    if (!selStream) return;
    setLoading(true);
    getClassResults(selStream, { term, academic_year: year })
      .then(r => setResults(r.data))
      .finally(() => setLoading(false));
  };

  const openReport = () => {
    window.open(`/api/reports/class/${selStream}/html?term=${term}&academic_year=${year}`, '_blank');
  };

  const streamName = streams.find(s => String(s.id) === String(selStream))?.name || '';

  const gradeColor = (g) => {
    const map = { A: '#1a7a3c', B: '#2a6496', C: '#8a6d3b', D: '#a94442', E: '#d9534f', U: '#d9534f' };
    return map[g] || '#333';
  };

  return (
    <>
      <div className="page-header">
        <h2>Class Rankings</h2>
        {results && (
          <button className="btn btn-primary" onClick={openReport}>📄 Print Class Report</button>
        )}
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-title">Select Class</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Class Stream</label>
              <select className="form-control" value={selStream} onChange={e => setSelStream(e.target.value)}>
                <option value="">Choose stream...</option>
                {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
          <button className="btn btn-primary" disabled={!selStream || loading} onClick={handleLoad}>
            {loading ? 'Loading...' : '🏆 Load Rankings'}
          </button>
        </div>

        {results && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0 }}>
                {streamName} — {term} {year}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                {results.total_students} students
              </div>
            </div>

            {/* Top 3 podium */}
            {results.results.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24, alignItems: 'flex-end' }}>
                {[results.results[1], results.results[0], results.results[2]].map((s, i) => {
                  const medals = ['🥈', '🥇', '🥉'];
                  const heights = [90, 110, 75];
                  return (
                    <div key={s.student_id} style={{ textAlign: 'center', width: 130 }}>
                      <div style={{ fontSize: 22 }}>{medals[i]}</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.first_name} {s.last_name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{s.average}%</div>
                      <div style={{
                        height: heights[i], background: i === 1 ? '#e8a020' : i === 0 ? '#9e9e9e' : '#cd7f32',
                        borderRadius: '6px 6px 0 0', marginTop: 8, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 20
                      }}>
                        #{s.position}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Pos</th><th>Student No</th><th>Name</th><th>Total</th><th>Max</th><th>Average %</th><th>Grade</th><th>Remark</th></tr>
                </thead>
                <tbody>
                  {results.results.map(s => (
                    <tr key={s.student_id}>
                      <td>
                        <span style={{ fontWeight: 700, color: s.position <= 3 ? '#e8a020' : '#333' }}>
                          {s.position <= 3 ? ['🥇','🥈','🥉'][s.position - 1] : ''} #{s.position}
                        </span>
                      </td>
                      <td>{s.student_number}</td>
                      <td>{s.last_name}, {s.first_name}</td>
                      <td>{s.total_marks}</td>
                      <td>{s.max_marks}</td>
                      <td><strong>{s.average}%</strong></td>
                      <td><span style={{ color: gradeColor(s.grade), fontWeight: 600 }}>{s.grade}</span></td>
                      <td style={{ color: '#6b7280' }}>{s.grade_label}</td>
                    </tr>
                  ))}
                  {!results.results.length && (
                    <tr><td colSpan={8} className="empty">No results found for this period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
