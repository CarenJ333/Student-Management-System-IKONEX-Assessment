import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, updateStudent, getStudentResults, getStreams, getStreamSubjects } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState(null);
  const [streams, setStreams] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [term, setTerm]       = useState('Term 1');
  const [year, setYear]       = useState('2024/2025');
  const [selSubject, setSelSubject]         = useState('');
  const [streamSubjects, setStreamSubjects] = useState([]);
  const { showToast, ToastComponent }       = useToast();

  const loadStudent = () => getStudent(id).then(r => {
    setStudent(r.data);
    setForm(r.data);
    getStreamSubjects(r.data.stream_id).then(s => setStreamSubjects(Array.isArray(s.data) ? s.data : []));
  });
  const loadResults = () => getStudentResults(id, { term, academic_year: year, subject_id: selSubject || undefined }).then(r => setResults(r.data));

  useEffect(() => {
    Promise.all([loadStudent(), getStreams().then(r => setStreams(Array.isArray(r.data) ? r.data : []))]);
  }, [id]);

  useEffect(() => { if (id) loadResults(); }, [id, term, year, selSubject]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await updateStudent(id, form);
      showToast('Student updated'); setEditing(false); loadStudent();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error updating student', 'error');
    } finally { setSaving(false); }
  };

  const openReport = () => {
    const url = `/api/reports/student/${id}/html?term=${term}&academic_year=${year}`;
    window.open(url, '_blank');
  };

  if (!student) return <div className="loading">Loading student...</div>;

  return (
    <>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/students')}>← Back</button>
          <h2>{student.first_name} {student.last_name}</h2>
          <span className={`badge badge-${student.status === 'Active' ? 'active' : 'inactive'}`}>{student.status}</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel Edit' : '✏️ Edit'}
          </button>
          <button className="btn btn-primary" onClick={openReport}>📄 Print Report Card (PDF)</button>
        </div>
      </div>

      <div className="page-body">
        {editing ? (
          <div className="card">
            <div className="card-title">Edit Student Information</div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                {[
                  { label:'Student Number', key:'student_number', required:true },
                  { label:'First Name',     key:'first_name',     required:true },
                  { label:'Last Name',      key:'last_name',      required:true },
                  { label:'Email',          key:'email',          type:'email' },
                  { label:'Phone',          key:'phone' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}{f.required ? ' *' : ''}</label>
                    <input className="form-control" type={f.type || 'text'} required={f.required}
                      value={form[f.key] || ''}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Class Stream *</label>
                  <select className="form-control" value={form.stream_id}
                    onChange={e => setForm({ ...form, stream_id: e.target.value })}>
                    {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={form.gender || ''}
                    onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option><option>Inactive</option><option>Transferred</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card">
            <div className="card-title">Student Information</div>
            <div className="form-grid">
              {[
                { label:'Student Number', value: student.student_number },
                { label:'Stream',         value: student.stream_name },
                { label:'Date of Birth',  value: student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '—' },
                { label:'Gender',         value: student.gender || '—' },
                { label:'Email',          value: student.email  || '—' },
                { label:'Phone',          value: student.phone  || '—' },
                { label:'Enrolled',       value: student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : '—' },
                { label:'Status',         value: student.status },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', fontWeight:600 }}>{f.label}</div>
                  <div style={{ marginTop:4 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Results */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="card-title" style={{ margin:0 }}>Academic Results</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <select className="form-control" style={{ width:160 }} value={selSubject}
                onChange={e => setSelSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {streamSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select className="form-control" style={{ width:120 }} value={term} onChange={e => setTerm(e.target.value)}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
              <input className="form-control" style={{ width:110 }} value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </div>

          {results ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Subject</th><th>Code</th>
                      <th>Exam /70</th><th>CA /30</th><th>Combined /100</th>
                      <th>Grade</th><th>Remark</th><th>Subject Pos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.subjects?.map((s, i) => (
                      <tr key={s.subject_id}>
                        <td>{i + 1}</td>
                        <td>{s.subject_name}</td>
                        <td>{s.code}</td>
                        <td>{s.exam_score ?? '—'}</td>
                        <td>{s.ca_score  ?? '—'}</td>
                        <td><strong>{s.combined ?? '—'}</strong></td>
                        <td><span className={`badge badge-${s.grade}`}>{s.grade}</span></td>
                        <td>{s.grade_label}</td>
                        <td>
                          <span style={{ fontWeight:600, color: s.subject_position <= 3 ? '#e8a020' : '#333' }}>
                            #{s.subject_position}/{s.out_of}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!results.subjects?.length && (
                      <tr><td colSpan={8} className="empty">No scores recorded for this period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {results.subjects?.length > 0 && (
                <div style={{ marginTop:16, padding:'14px 16px', background:'#f0f4fa', borderRadius:8, display:'flex', gap:32, flexWrap:'wrap' }}>
                  {!selSubject && (
                    <>
                      <div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>Subjects Scored</div>
                        <strong>{results.summary?.total_subjects}</strong>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>Total Points</div>
                        <strong>{results.summary?.total_points}</strong>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>Average</div>
                        <strong>{results.summary?.average}%</strong>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>Overall Grade</div>
                        <strong>
                          <span className={`badge badge-${results.summary?.grade}`}>
                            {results.summary?.grade} — {results.summary?.grade_label}
                          </span>
                        </strong>
                      </div>
                    </>
                  )}
                  {selSubject && results.subject_position && (
                    <div style={{ display:'flex', gap:32 }}>
                      <div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>Subject Position</div>
                        <strong style={{ fontSize:18, color:'#e8a020' }}>
                          #{results.subject_position.position} / {results.subject_position.out_of}
                        </strong>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>Combined Score</div>
                        <strong>{results.subjects[0]?.combined}/100</strong>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>Grade</div>
                        <strong>
                          <span className={`badge badge-${results.subjects[0]?.grade}`}>
                            {results.subjects[0]?.grade} — {results.subjects[0]?.grade_label}
                          </span>
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : <div className="loading">Loading results...</div>}
        </div>
      </div>
      {ToastComponent}
    </>
  );
}
