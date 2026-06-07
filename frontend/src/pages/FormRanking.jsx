import React, { useEffect, useState } from 'react';
import { getFormRanking } from '../utils/api';

export default function FormRanking() {
  const [formLevel, setFormLevel] = useState('1');
  const [term, setTerm]           = useState('Term 1');
  const [year, setYear]           = useState('2024/2025');
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);

  const handleLoad = () => {
    setLoading(true);
    getFormRanking({ form_level: formLevel, term, academic_year: year })
      .then(r => setResults(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const openReport = () => {
    window.open(`${import.meta.env.VITE_API_URL || '/api'}/reports/form-ranking/html?form_level=${formLevel}&term=${term}&academic_year=${year}`, '_blank');
  };

  const gradeColor = (g) => {
    const map = { A: '#1a7a3c', B: '#2a6496', C: '#8a6d3b', D: '#a94442', E: '#d9534f', U: '#d9534f' };
    return map[g] || '#333';
  };

  return (
    <>
      <div className="page-header">
        <h2>Form-Wide Rankings</h2>
        {results && (
          <button className="btn btn-primary" onClick={openReport}>📄 Print Form Report</button>
        )}
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-title">Select Form Level</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Form Level</label>
              <select className="form-control" value={formLevel} onChange={e => setFormLevel(e.target.value)}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Form {n}</option>)}
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
          <button className="btn btn-primary" disabled={loading} onClick={handleLoad}>
            {loading ? 'Loading...' : '🏆 Load Form Rankings'}
          </button>
        </div>

        {results && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0 }}>
                Form {formLevel} Overall Rankings — {results.streams?.join(', ')}
              </div>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                {results.total_students} students across all streams
              </span>
            </div>

            {results.results?.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24, alignItems: 'flex-end' }}>
                {[results.results[1], results.results[0], results.results[2]].map((s, i) => {
                  const medals  = ['🥈', '🥇', '🥉'];
                  const heights = [90, 110, 75];
                  const colors  = ['#9e9e9e', '#e8a020', '#cd7f32'];
                  return (
                    <div key={s.student_id} style={{ textAlign: 'center', width: 140 }}>
                      <div style={{ fontSize: 22 }}>{medals[i]}</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.first_name} {s.last_name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{s.stream_name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{s.average}%</div>
                      <div style={{
                        height: heights[i], background: colors[i],
                        borderRadius: '6px 6px 0 0', marginTop: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: 20
                      }}>#{s.overall_position}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Overall Pos</th><th>Student No</th><th>Name</th><th>Stream</th>
                    <th>Total Points</th><th>Average %</th><th>Grade</th><th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results?.map(s => (
                    <tr key={s.student_id}>
                      <td>
                        <strong style={{ color: s.overall_position <= 3 ? '#e8a020' : '#333' }}>
                          {s.overall_position <= 3 ? ['🥇','🥈','🥉'][s.overall_position - 1] + ' ' : ''}
                          #{s.overall_position}
                        </strong>
                      </td>
                      <td>{s.student_number}</td>
                      <td>{s.last_name}, {s.first_name}</td>
                      <td>
                        <span className="badge" style={{ background: '#e8f0fe', color: '#1a3c6e' }}>
                          {s.stream_name}
                        </span>
                      </td>
                      <td>{s.total_points}</td>
                      <td><strong>{s.average}%</strong></td>
                      <td><span style={{ color: gradeColor(s.grade), fontWeight: 600 }}>{s.grade}</span></td>
                      <td style={{ color: '#6b7280' }}>{s.grade_label}</td>
                    </tr>
                  ))}
                  {!results.results?.length && (
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
