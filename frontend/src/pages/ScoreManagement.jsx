import React, { useEffect, useState } from 'react';
import { getStudents, getStudentScores, deleteScoreByStudentAssessment } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function ScoreManagement() {
  const [students, setStudents]   = useState([]);
  const [search, setSearch]       = useState('');
  const [showDrop, setShowDrop]   = useState(false);
  const [selStudent, setSelStudent] = useState(null);
  const [scores, setScores]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    getStudents().then(r => setStudents(Array.isArray(r.data) ? r.data : []));
  }, []);

  const filtered = search.length >= 1
    ? students.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        s.student_number.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleSelect = (s) => {
    setSelStudent(s);
    setSearch(`${s.first_name} ${s.last_name} (${s.student_number})`);
    setShowDrop(false);
    setLoading(true);
    getStudentScores(s.id)
      .then(r => setScores(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (score) => {
    if (!window.confirm(`Remove ${score.subject_name} — ${score.assessment_name} score for this student?`)) return;
    try {
      await deleteScoreByStudentAssessment(selStudent.id, score.assessment_id);
      showToast('Score removed successfully');
      setScores(scores.filter(s => s.assessment_id !== score.assessment_id));
    } catch (err) {
      showToast(err.response?.data?.error || 'Error removing score', 'error');
    }
  };

  // Group scores by subject
  const grouped = scores.reduce((acc, s) => {
    if (!acc[s.subject_name]) acc[s.subject_name] = [];
    acc[s.subject_name].push(s);
    return acc;
  }, {});

  const uniqueSubjects = Object.keys(grouped).length;

  return (
    <>
      <div className="page-header">
        <h2>Score Management</h2>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-title">Select Student</div>
          <div className="form-group" style={{ position:'relative', maxWidth:400 }}>
            <label className="form-label">Search Student</label>
            <input
              className="form-control"
              placeholder="Type name or student number..."
              value={search}
              onChange={e => { setSearch(e.target.value); setSelStudent(null); setShowDrop(true); setScores([]); }}
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
                {filtered.length ? filtered.slice(0, 8).map(s => (
                  <div key={s.id}
                    style={{ padding:'9px 14px', cursor:'pointer', borderBottom:'1px solid #f0f0f0', fontSize:13 }}
                    onMouseDown={() => handleSelect(s)}>
                    <strong>{s.last_name}, {s.first_name}</strong>
                    <span style={{ color:'#6b7280', marginLeft:8 }}>{s.student_number} — {s.stream_name}</span>
                  </div>
                )) : (
                  <div style={{ padding:'9px 14px', color:'#999', fontSize:13 }}>No students found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {selStudent && (
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div className="card-title" style={{ margin:0 }}>
                {selStudent.first_name} {selStudent.last_name} — Scores & Subjects
              </div>
              <div style={{ display:'flex', gap:16, fontSize:13, color:'#6b7280' }}>
                <span>📚 {uniqueSubjects} subjects</span>
                <span>📝 {scores.length} score entries</span>
              </div>
            </div>

            {uniqueSubjects > 0 && (
              <div style={{ background:'#fff3cd', border:'1px solid #ffc107', borderRadius:6, padding:'10px 14px', marginBottom:16, fontSize:13 }}>
                ⚠️ To remove a subject entry for this student, click <strong>Remove</strong> on that score row. This removes only that assessment score, not the subject itself.
              </div>
            )}

            {loading ? <div className="loading">Loading scores...</div> : (
              Object.entries(grouped).length ? (
                Object.entries(grouped).map(([subjectName, subjectScores]) => (
                  <div key={subjectName} style={{ marginBottom:20 }}>
                    <div style={{ fontWeight:600, color:'var(--primary)', marginBottom:8, fontSize:14,
                      borderBottom:'2px solid var(--border)', paddingBottom:6 }}>
                      📚 {subjectName}
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Assessment</th><th>Type</th><th>Score</th>
                            <th>Max</th><th>Stream</th><th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectScores.map(s => (
                            <tr key={s.id}>
                              <td>{s.assessment_name}</td>
                              <td><span className="badge" style={{ background:'#fff3cd', color:'#856404' }}>{s.type}</span></td>
                              <td><strong>{s.score}</strong></td>
                              <td>{s.max_score}</td>
                              <td>{s.stream_name}</td>
                              <td>
                                <button className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(s)}>
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">No scores found for this student.</div>
              )
            )}
          </div>
        )}
      </div>
      {ToastComponent}
    </>
  );
}