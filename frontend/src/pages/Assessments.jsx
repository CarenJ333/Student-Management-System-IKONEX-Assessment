import React, { useEffect, useState } from 'react';
import { getAssessments, createAssessment, updateAssessment, deleteAssessment, getStreams, getSubjects } from '../utils/api';
import { useToast } from '../hooks/useToast';

const EMPTY = { name: '', type: 'Exam', stream_id: '', subject_id: '', max_score: 100, weight: 100, academic_year: '2024/2025', term: 'Term 1' };

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [streams, setStreams]   = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [filters, setFilters]   = useState({ stream_id: '', term: '', academic_year: '' });
  const { showToast, ToastComponent } = useToast();

  const load = () => getAssessments(filters).then(r => setAssessments(Array.isArray(r.data) ? r.data : []));
  useEffect(() => {
    Promise.all([getStreams().then(r => setStreams(Array.isArray(r.data) ? r.data : [])), getSubjects().then(r => setSubjects(Array.isArray(r.data) ? r.data : []))]);
  }, []);
  useEffect(() => { load(); }, [filters]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (a) => { setEditing(a); setForm({ ...a }); setModal(true); };
  const close      = () => { setModal(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editing ? await updateAssessment(editing.id, form) : await createAssessment(form);
      showToast(editing ? 'Assessment updated' : 'Assessment created');
      close(); load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error saving', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete assessment "${a.name}"?`)) return;
    try { await deleteAssessment(a.id); showToast('Deleted'); load(); }
    catch (err) { showToast('Error deleting', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Assessments</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New Assessment</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="toolbar">
            <select className="form-control" style={{ width: 160 }} value={filters.stream_id}
              onChange={e => setFilters({ ...filters, stream_id: e.target.value })}>
              <option value="">All Streams</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="form-control" style={{ width: 130 }} value={filters.term}
              onChange={e => setFilters({ ...filters, term: e.target.value })}>
              <option value="">All Terms</option>
              <option>Term 1</option><option>Term 2</option><option>Term 3</option>
            </select>
            <input className="form-control" style={{ width: 120 }} placeholder="Year e.g. 2024/2025"
              value={filters.academic_year} onChange={e => setFilters({ ...filters, academic_year: e.target.value })} />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Stream</th><th>Subject</th><th>Max Score</th><th>Term</th><th>Year</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {assessments.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.name}</strong></td>
                    <td><span className="badge" style={{ background: '#fff3cd', color: '#856404' }}>{a.type}</span></td>
                    <td>{a.stream_name}</td>
                    <td>{a.subject_name}</td>
                    <td>{a.max_score}</td>
                    <td>{a.term}</td>
                    <td>{a.academic_year}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>Edit</button>
                      <button className="btn btn-danger  btn-sm" onClick={() => handleDelete(a)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!assessments.length && <tr><td colSpan={8} className="empty">No assessments found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Assessment' : 'New Assessment'}</h3>
              <button className="btn btn-outline btn-sm" onClick={close}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Assessment Name *</label>
                  <input className="form-control" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid-Term Exam" />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-control" value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option>Exam</option><option>CA</option><option>Quiz</option><option>Assignment</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Term *</label>
                    <select className="form-control" value={form.term}
                      onChange={e => setForm({ ...form, term: e.target.value })}>
                      <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Class Stream *</label>
                    <select className="form-control" required value={form.stream_id}
                      onChange={e => setForm({ ...form, stream_id: e.target.value })}>
                      <option value="">Select stream...</option>
                      {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <select className="form-control" required value={form.subject_id}
                      onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                      <option value="">Select subject...</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Score</label>
                    <input className="form-control" type="number" min={1} value={form.max_score}
                      onChange={e => setForm({ ...form, max_score: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Year *</label>
                    <input className="form-control" required value={form.academic_year}
                      onChange={e => setForm({ ...form, academic_year: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {ToastComponent}
    </>
  );
}
