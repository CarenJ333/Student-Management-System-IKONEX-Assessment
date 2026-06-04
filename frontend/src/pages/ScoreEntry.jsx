import React, { useEffect, useState } from 'react';
import { getStreams, getAssessments, getStreamStudents, getScores, bulkSubmitScores } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function ScoreEntry() {
  const [streams, setStreams]         = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents]       = useState([]);
  const [existingScores, setExisting] = useState({});
  const [scoreInputs, setScoreInputs] = useState({});
  const [selStream, setSelStream]     = useState('');
  const [selAssessment, setSelAssessment] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    getStreams().then(r => setStreams(Array.isArray(r.data) ? r.data : []));
  }, []);

  useEffect(() => {
    if (selStream) {
      getAssessments({ stream_id: selStream }).then(r => setAssessments(Array.isArray(r.data) ? r.data : []));
      getStreamStudents(selStream).then(r => setStudents(Array.isArray(r.data) ? r.data : []));
      setSelAssessment(''); setScoreInputs({}); setExisting({});
    }
  }, [selStream]);

  useEffect(() => {
    if (selAssessment && students.length) {
      getScores({ assessment_id: selAssessment }).then(r => {
        const map = {};
        r.data.forEach(s => { map[s.student_id] = { score: s.score, id: s.id }; });
        setExisting(map);
        const inputs = {};
        students.forEach(st => { inputs[st.id] = map[st.id] ? String(map[st.id].score) : ''; });
        setScoreInputs(inputs);
      });
    }
  }, [selAssessment, students]);

  const selectedAssessment = assessments.find(a => String(a.id) === String(selAssessment));

  const handleSubmit = async () => {
    if (!selAssessment) { showToast('Select an assessment first', 'error'); return; }
    setSubmitting(true);
    const scores = Object.entries(scoreInputs)
      .filter(([, val]) => val !== '' && val !== null)
      .map(([student_id, score]) => ({ student_id: parseInt(student_id), score: parseFloat(score) }));

    try {
      const result = await bulkSubmitScores({ assessment_id: selAssessment, scores });
      const { inserted, errors } = result.data;
      if (errors.length) {
        showToast(`Saved ${inserted}, ${errors.length} error(s): ${errors[0].error}`, 'error');
      } else {
        showToast(`✅ ${inserted} scores saved successfully`);
      }
      if (selAssessment) getScores({ assessment_id: selAssessment }).then(r => {
        const map = {};
        r.data.forEach(s => { map[s.student_id] = { score: s.score, id: s.id }; });
        setExisting(map);
      });
    } catch (err) {
      showToast(err.response?.data?.error || 'Error saving scores', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Score Entry</h2>
        {selAssessment && students.length > 0 && (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : `💾 Save ${Object.values(scoreInputs).filter(v => v !== '').length} Scores`}
          </button>
        )}
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-title">Select Assessment</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Class Stream</label>
              <select className="form-control" value={selStream}
                onChange={e => setSelStream(e.target.value)}>
                <option value="">Choose stream...</option>
                {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assessment</label>
              <select className="form-control" value={selAssessment} disabled={!selStream}
                onChange={e => setSelAssessment(e.target.value)}>
                <option value="">Choose assessment...</option>
                {assessments.map(a => (
                  <option key={a.id} value={a.id}>{a.name} — {a.subject_name} ({a.term})</option>
                ))}
              </select>
            </div>
          </div>
          {selectedAssessment && (
            <div style={{ background: '#f0f4fa', padding: '10px 14px', borderRadius: 6, fontSize: 13, display: 'flex', gap: 24 }}>
              <span><strong>Subject:</strong> {selectedAssessment.subject_name}</span>
              <span><strong>Type:</strong> {selectedAssessment.type}</span>
              <span><strong>Max Score:</strong> {selectedAssessment.max_score}</span>
              <span><strong>Term:</strong> {selectedAssessment.term}</span>
            </div>
          )}
        </div>

        {selAssessment && students.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="card-title" style={{ margin: 0 }}>
                Enter Scores — {students.length} students
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Already entered: {Object.keys(existingScores).length} | Remaining: {students.length - Object.keys(existingScores).length}
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Student No</th><th>Name</th>
                    <th>Score (Max: {selectedAssessment?.max_score})</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, i) => {
                    const hasExisting = !!existingScores[st.id];
                    return (
                      <tr key={st.id}>
                        <td>{i + 1}</td>
                        <td>{st.student_number}</td>
                        <td>{st.last_name}, {st.first_name}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            max={selectedAssessment?.max_score}
                            step="0.5"
                            className="form-control"
                            style={{ width: 100 }}
                            value={scoreInputs[st.id] ?? ''}
                            onChange={e => setScoreInputs({ ...scoreInputs, [st.id]: e.target.value })}
                            placeholder="—"
                          />
                        </td>
                        <td>
                          {hasExisting
                            ? <span className="badge badge-active">Saved</span>
                            : scoreInputs[st.id] !== ''
                            ? <span className="badge" style={{ background: '#fff3cd', color: '#856404' }}>Pending</span>
                            : <span className="badge" style={{ background: '#f5f5f5', color: '#999' }}>Empty</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : '💾 Save All Scores'}
              </button>
            </div>
          </div>
        )}

        {selStream && !selAssessment && assessments.length === 0 && (
          <div className="card"><div className="empty">No assessments found for this stream. Create one first.</div></div>
        )}
      </div>
      {ToastComponent}
    </>
  );
}
