import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStream, getStreamStudents, getStreamSubjects } from '../utils/api';

export default function StreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stream, setStream]     = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getStream(id),
      getStreamStudents(id),
      getStreamSubjects(id),
    ]).then(([s, st, sub]) => {
      setStream(s.data);
      setStudents(Array.isArray(st.data) ? st.data : []);
      setSubjects(Array.isArray(sub.data) ? sub.data : []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading stream details...</div>;
  if (!stream)  return <div className="empty">Stream not found.</div>;

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/streams')}>← Back</button>
          <h2>{stream.name}</h2>
          <span className="badge badge-active">{stream.academic_year}</span>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/students?stream_id=${id}`)}>
          View All Students
        </button>
      </div>

      <div className="page-body">

        {/* Stream Info */}
        <div className="card">
          <div className="card-title">Stream Information</div>
          <div className="form-grid">
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Stream Name</div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600 }}>{stream.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Form Level</div>
              <div style={{ marginTop: 4 }}>Form {stream.form_level}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Academic Year</div>
              <div style={{ marginTop: 4 }}>{stream.academic_year}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Students</div>
              <div style={{ marginTop: 4 }}>
                <span className="badge badge-active">{students.length} students</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects assigned */}
        <div className="card">
          <div className="card-title">Subjects Offered ({subjects.length})</div>
          {subjects.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {subjects.map(s => (
                <span key={s.id} className="badge"
                  style={{ background: '#e8f0fe', color: '#1a3c6e', fontSize: 13, padding: '6px 14px' }}>
                  {s.name} — {s.code}
                </span>
              ))}
            </div>
          ) : (
            <div className="empty">No subjects assigned to this stream yet. Go to Subjects to assign some.</div>
          )}
        </div>

        {/* Students list */}
        <div className="card">
          <div className="card-title">Enrolled Students ({students.length})</div>
          {students.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student No</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td><strong>{s.student_number}</strong></td>
                      <td>{s.last_name}, {s.first_name}</td>
                      <td>{s.gender || '—'}</td>
                      <td>
                        <span className={`badge badge-${s.status === 'Active' ? 'active' : 'inactive'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm"
                          onClick={() => navigate(`/students/${s.id}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">No students enrolled in this stream yet.</div>
          )}
        </div>

      </div>
    </>
  );
}
