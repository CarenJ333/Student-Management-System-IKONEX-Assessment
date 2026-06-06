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
  const [validationErrors, setValidationErrors] = useState({});
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    getStreams().then(r => setStreams(Array.isArray(r.data) ? r.data : []));
  }, []);

  useEffect(() => {
    if (selStream) {
      getAssessments({ stream_id: selStream }).then(r => setAssessments(Array.isArray(r.data) ? r.data : []));
      getStreamStudents(selStream).then(r => setStudents(Array.isArray(r.data) ? r.data : []));
      setSelAssessment(''); setScoreInputs({}); setExisting({}); setValidationErrors({});
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
        setValidationErrors({});
      });
    }
  }, [selAssessment, students]);

  const selectedAssessment = assessments.find(a => String(a.id) === String(selAssessment));

  // Validate a single score input
  const validateScore = (studentId, value) => {
    const errors = { ...validationErrors };
    if (value === '' || value === null) {
      delete errors[studentId];
    } else {
      const num = parseFloat(value);
      if (isNaN(num)) {
        errors[studentId] = 'Must be a number';
      } else if (num < 0) {
        errors[studentId] = 'Cannot be negative';
      } else if (selectedAssessment && num > parseFloat(selectedAssessment.max_score)) {
        errors[studentId] = `Max is ${selectedAssessment.max_score}`;
      } else {
        delete errors[studentId];
      }
    }
    setValidationErrors(errors);
    return !errors[studentId];
  };

  const handleScoreChange = (studentId, value) => {
    setScoreInputs({ ...scoreInputs, [studentId]: value });
    validateScore(studentId, value);
  };

  const handleSubmit = async () => {
    if (!selAssessment) { showToast('Select an assessment first', 'error'); return; }

    // Validate all inputs before submitting
    let hasErrors = false;
    const newErrors = {};
    Object.entries(scoreInputs).forEach(([sid, val]) => {
      if (val === '' || val === null) return;
      const num = parseFloat(val);
      if (isNaN(num)) { newErrors[sid] = 'Must be a number'; hasErrors = true; }
      else if (num < 0) { newErrors[sid] = 'Cannot be negative'; hasErrors = true; }
      else if (selectedAssessment && num > parseFloat(selectedAssessment.max_score)) {
        newErrors[sid] = `Max is ${selectedAssessment.max_score}`; hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(newErrors);
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    setSubmitting(true);
    const scores = Object.entries(scoreInputs)
      .filter(([, val]) => val !== '' && val !== null)
      .map(([student_id, score]) => ({ student_id: parseInt(student_id), score: parseFloat(score) }));

    try {
      const result = await bulkSubmitScores({ assessment_id: selAssessment, scores });
      const { inserted, errors } = result.data;

      if (errors.length) {
        // Show duplicate errors per student
        const errMap = {};
        errors.forEach(e => { errMap[e.student_id] = e.error; });
        setValidationErrors(errMap);
        showToast(`${inserted} saved. ${errors.length} error(s) — see highlighted rows`, 'error');
      } else {
        showToast(`✅ ${inserted} scores saved successfully`);
        setValidationErrors({});
      }

      // Refresh existing scores
      getScores({ assessment_id: selAssessment }).then(r => {
        const map = {};
        r.data.forEach(s => { map[s.student_id] = { score: s.score, id: s.id }; });
        setExisting(map);
      });
    } catch (err) {
      showToast(err.response?.data?.error || 'Error saving scores', 'error');
    } finally { setSubmitting(false); }
  };

  const pendingCount = Object.values(scoreInputs).filter(v => v !== '').length;

  return (
    <>
      <div className="page-header">
        <h2>Score Entry</h2>
        {selAssessment && students.length > 0 && (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : `💾 Save ${pendingCount} Scores`}
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
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.subject_name} ({a.type}, {a.term})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedAssessment && (
            <div style={{ background:'#f0f4fa', padding:'10px 14px', borderRadius:6, fontSize:13, display:'flex', gap:24, flexWrap:'wrap' }}>
              <span><strong>Subject:</strong> {selectedAssessment.subject_name}</span>
              <span><strong>Type:</strong> {selectedAssessment.type}</span>
              <span><strong>Max Score:</strong> {selectedAssessment.max_score}</span>
              <span><strong>Term:</strong> {selectedAssessment.term}</span>
              <span><strong>Year:</strong> {selectedAssessment.academic_year}</span>
            </div>
          )}
        </div>

        {selAssessment && students.length > 0 && (
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <div className="card-title" style={{ margin:0 }}>
                {Object.keys(existingScores).length > 0
                  ? `✏️ Editing Scores — ${students.length} students`
                  : `Enter Scores — ${students.length} students`}
              </div>
              <div style={{ fontSize:12, color:'#6b7280', display:'flex', gap:16 }}>
                <span>
                  <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#1a7a3c', marginRight:4 }}/>
                  Saved: {Object.keys(existingScores).length}
                </span>
                <span>
                  <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#e8a020', marginRight:4 }}/>
                  Pending: {pendingCount - Object.keys(existingScores).length < 0 ? 0 : pendingCount}
                </span>
                <span>
                  <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#ddd', marginRight:4 }}/>
                  Empty: {students.length - pendingCount}
                </span>
              </div>
            </div>

            {Object.keys(validationErrors).length > 0 && (
              <div style={{ background:'#fdf0f0', border:'1px solid #f5c6cb', borderRadius:6, padding:'10px 14px', marginBottom:12, fontSize:13, color:'#721c24' }}>
                ⚠️ <strong>Please fix the highlighted errors before saving.</strong> Duplicate scores will overwrite existing values.
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Student No</th><th>Name</th>
                    <th>Score (Max: {selectedAssessment?.max_score})</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, i) => {
                    const hasExisting = !!existingScores[st.id];
                    const hasError    = !!validationErrors[st.id];
                    const val         = scoreInputs[st.id] ?? '';
                    return (
                      <tr key={st.id} style={{ background: hasError ? '#fff8f8' : 'inherit' }}>
                        <td>{i + 1}</td>
                        <td>{st.student_number}</td>
                        <td>{st.last_name}, {st.first_name}</td>
                        <td>
                          <div>
                            <input
                              type="number"
                              min={0}
                              max={selectedAssessment?.max_score}
                              step="0.5"
                              className="form-control"
                              style={{
                                width: 100,
                                borderColor: hasError ? '#dc3545' : hasExisting ? '#1a7a3c' : undefined
                              }}
                              value={val}
                              onChange={e => handleScoreChange(st.id, e.target.value)}
                              placeholder="—"
                            />
                            {hasError && (
                              <div style={{ color:'#dc3545', fontSize:11, marginTop:3 }}>
                                ⚠️ {validationErrors[st.id]}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {hasError
                            ? <span className="badge" style={{ background:'#f8d7da', color:'#721c24' }}>Error</span>
                            : hasExisting
                            ? <span className="badge badge-active">✓ Saved</span>
                            : val !== ''
                            ? <span className="badge" style={{ background:'#fff3cd', color:'#856404' }}>Pending</span>
                            : <span className="badge" style={{ background:'#f5f5f5', color:'#999' }}>Empty</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button className="btn btn-outline" onClick={() => {
                const inputs = {};
                students.forEach(st => { inputs[st.id] = existingScores[st.id] ? String(existingScores[st.id].score) : ''; });
                setScoreInputs(inputs);
                setValidationErrors({});
              }}>Reset</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : '💾 Save All Scores'}
              </button>
            </div>
          </div>
        )}

        {selStream && !selAssessment && assessments.length === 0 && (
          <div className="card"><div className="empty">No assessments found for this stream. Create one in Assessments first.</div></div>
        )}
      </div>
      {ToastComponent}
    </>
  );
}