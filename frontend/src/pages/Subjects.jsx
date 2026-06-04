import React, { useEffect, useState } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject, getStreams, assignSubject, getStreamSubjects, removeSubject } from '../utils/api';
import { useToast } from '../hooks/useToast';

const EMPTY = { name: '', code: '', description: '' };

export default function Subjects() {
  const [subjects, setSubjects]   = useState([]);
  const [streams, setStreams]     = useState([]);
  const [modal, setModal]         = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [selStream, setSelStream] = useState('');
  const [streamSubjects, setStreamSubjects] = useState([]);
  const { showToast, ToastComponent } = useToast();

  const load = () => Promise.all([
    getSubjects().then(r => setSubjects(Array.isArray(r.data) ? r.data : [])),
    getStreams().then(r => setStreams(Array.isArray(r.data) ? r.data : [])),
  ]);
  useEffect(() => { load(); }, []);

  const loadStreamSubjects = (sid) =>
    getStreamSubjects(sid).then(r => setStreamSubjects(r.data));

  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, code: s.code, description: s.description || '' }); setModal(true); };
  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const close = () => { setModal(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editing ? await updateSubject(editing.id, form) : await createSubject(form);
      showToast(editing ? 'Subject updated' : 'Subject created');
      close(); load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error saving subject', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete subject "${s.name}"?`)) return;
    try { await deleteSubject(s.id); showToast('Subject deleted'); load(); }
    catch (err) { showToast(err.response?.data?.error || 'Error deleting', 'error'); }
  };

  const handleAssign = async (subjectId) => {
    try {
      await assignSubject({ stream_id: selStream, subject_id: subjectId });
      showToast('Subject assigned'); loadStreamSubjects(selStream);
    } catch (err) { showToast('Error assigning', 'error'); }
  };

  const handleRemove = async (subjectId) => {
    try {
      await removeSubject(selStream, subjectId);
      showToast('Subject removed'); loadStreamSubjects(selStream);
    } catch (err) { showToast('Error removing', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Subjects</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setAssignModal(true)}>🔗 Assign to Stream</button>
          <button className="btn btn-primary" onClick={openCreate}>+ New Subject</button>
        </div>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Subject Name</th><th>Code</th><th>Description</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td><strong>{s.name}</strong></td>
                    <td><span className="badge" style={{ background: '#e8f0fe', color: '#1a3c6e' }}>{s.code}</span></td>
                    <td style={{ color: '#6b7280' }}>{s.description || '—'}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger  btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!subjects.length && <tr><td colSpan={5} className="empty">No subjects yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Subject' : 'New Subject'}</h3>
              <button className="btn btn-outline btn-sm" onClick={close}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject Name *</label>
                  <input className="form-control" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Code *</label>
                  <input className="form-control" required value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. MATH101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Subjects to Stream</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setAssignModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Stream</label>
                <select className="form-control" value={selStream}
                  onChange={e => { setSelStream(e.target.value); if (e.target.value) loadStreamSubjects(e.target.value); }}>
                  <option value="">Choose stream...</option>
                  {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {selStream && (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Subject</th><th>Code</th><th>Action</th></tr></thead>
                    <tbody>
                      {subjects.map(sub => {
                        const assigned = streamSubjects.some(ss => ss.id === sub.id);
                        return (
                          <tr key={sub.id}>
                            <td>{sub.name}</td>
                            <td>{sub.code}</td>
                            <td>
                              {assigned
                                ? <button className="btn btn-danger btn-sm" onClick={() => handleRemove(sub.id)}>Remove</button>
                                : <button className="btn btn-success btn-sm" onClick={() => handleAssign(sub.id)}>Assign</button>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {ToastComponent}
    </>
  );
}
