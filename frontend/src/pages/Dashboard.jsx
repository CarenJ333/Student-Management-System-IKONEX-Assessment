import React, { useEffect, useState } from 'react';
import { getStudents, getStreams, getSubjects, getAssessments } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, streams: 0, subjects: 0, assessments: 0 });
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getStudents(), getStreams(), getSubjects(), getAssessments({})])
      .then(([s, st, sub, a]) => {
        const students    = Array.isArray(s.data)    ? s.data    : [];
        const streams     = Array.isArray(st.data)   ? st.data   : [];
        const subjects    = Array.isArray(sub.data)  ? sub.data  : [];
        const assessments = Array.isArray(a.data)    ? a.data    : [];
        setStats({
          students:    students.length,
          streams:     streams.length,
          subjects:    subjects.length,
          assessments: assessments.length,
        });
        setStreams(streams);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <span style={{ color: '#6b7280', fontSize: 13 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          {[
            { label: 'Total Students',   value: stats.students,   color: '#1a3c6e', click: '/students' },
            { label: 'Class Streams',    value: stats.streams,    color: '#2a5ba8', click: '/streams' },
            { label: 'Subjects',         value: stats.subjects,   color: '#1a7a3c', click: '/subjects' },
            { label: 'Assessments',      value: stats.assessments,color: '#8a6d3b', click: '/assessments' },
          ].map(s => (
            <div key={s.label} className="stat-card" onClick={() => navigate(s.click)}
              style={{ cursor: 'pointer', borderTop: `4px solid ${s.color}` }}>
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Class Streams Overview</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Stream</th>
                  <th>Form Level</th>
                  <th>Academic Year</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {streams.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>Form {s.form_level}</td>
                    <td>{s.academic_year}</td>
                    <td>
                      <span className="badge badge-active">{s.student_count}</span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/students?stream_id=${s.id}`)}>
                        View Students
                      </button>
                    </td>
                  </tr>
                ))}
                {!streams.length && (
                  <tr><td colSpan={5} className="empty">No streams yet — create one to get started</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/students')}>Register Student</button>
            <button className="btn btn-outline"  onClick={() => navigate('/streams')}>Add Class Stream</button>
            <button className="btn btn-outline"  onClick={() => navigate('/scores')}>Enter Scores</button>
            <button className="btn btn-outline"  onClick={() => navigate('/class-results')}> View Rankings</button>
          </div>
        </div>
      </div>
    </>
  );
}
