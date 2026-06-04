import React, { useEffect, useState } from 'react';
import { getStreams, createStream, updateStream, deleteStream } from '../utils/api';
import { useToast } from '../hooks/useToast';

const EMPTY = { name: '', form_level: 1, academic_year: '2024/2025' };

export default function Streams() {
  const [streams, setStreams]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const { showToast, ToastComponent } = useToast();

  const load = () => getStreams().then(r => setStreams(Array.isArray(r.data) ? r.data : [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (s)  => { setEditing(s); setForm({ name: s.name, form_level: s.form_level, academic_year: s.academic_year }); setModal(true); };
  const close      = ()   => { setModal(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateStream(editing.id, form);
        showToast('Stream updated successfully');
      } else {
        await createStream(form);
        showToast('Stream created successfully');
      }
      close(); load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Something went wrong', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete stream "${s.name}"? This cannot be undone.`)) return;
    try {
      await deleteStream(s.id);
      showToast('Stream deleted');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Cannot delete stream', 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Class Streams</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New Stream</button>
      </div>
      <div className="page-body">
        <div className="card">
          {loading ? <div className="loading">Loading...</div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Form Level</th><th>Academic Year</th><th>Students</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {streams.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>Form {s.form_level}</td>
                      <td>{s.academic_year}</td>
                      <td><span className="badge badge-active">{s.student_count}</span></td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-danger  btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {!streams.length && <tr><td colSpan={5} className="empty">No streams yet</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Stream' : 'New Class Stream'}</h3>
              <button className="btn btn-outline btn-sm" onClick={close}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Stream Name *</label>
                  <input className="form-control" placeholder="e.g. Form 1A" required
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Form Level *</label>
                    <select className="form-control" value={form.form_level}
                      onChange={e => setForm({ ...form, form_level: e.target.value })}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Form {n}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Year *</label>
                    <input className="form-control" placeholder="2024/2025" required
                      value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Stream'}
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
