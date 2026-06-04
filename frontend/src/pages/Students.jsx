import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStudents, getStreams, createStudent, deleteStudent } from '../utils/api';
import { useToast } from '../hooks/useToast';

const EMPTY = {
  student_number: '', first_name: '', last_name: '', date_of_birth: '',
  gender: '', email: '', phone: '', address: '', stream_id: '', enrollment_date: ''
};

export default function Students() {
  const [students, setStudents]   = useState([]);
  const [streams, setStreams]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const { showToast, ToastComponent } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const load = () =>
    Promise.all([getStudents(), getStreams()])
      .then(([s, st]) => { setStudents(Array.isArray(s.data) ? s.data : []); setStreams(Array.isArray(st.data) ? st.data : []); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const sid = params.get('stream_id');
    if (sid) setStreamFilter(sid);
  }, [params]);

  useEffect(() => {
    let list = students;
    if (streamFilter) list = list.filter(s => String(s.stream_id) === String(streamFilter));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.student_number.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [students, search, streamFilter]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await createStudent(form);
      showToast('Student registered successfully');
      setModal(false); setForm(EMPTY); load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error saving student', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete student ${s.first_name} ${s.last_name}?`)) return;
    try {
      await deleteStudent(s.id);
      showToast('Student deleted'); load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error deleting student', 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Students</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Register Student</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="toolbar">
            <input className="form-control search-box" placeholder="Search by name or student number..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-control" style={{ width: 180 }} value={streamFilter}
              onChange={e => setStreamFilter(e.target.value)}>
              <option value="">All Streams</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {loading ? <div className="loading">Loading students...</div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Student No</th><th>Name</th><th>Stream</th><th>Gender</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.student_number}</strong></td>
                      <td>{s.last_name}, {s.first_name}</td>
                      <td>{s.stream_name}</td>
                      <td>{s.gender || '—'}</td>
                      <td><span className={`badge badge-${s.status === 'Active' ? 'active' : 'inactive'}`}>{s.status}</span></td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/students/${s.id}`)}>View</button>
                        <button className="btn btn-danger  btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && <tr><td colSpan={6} className="empty">No students found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Student</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Student Number *</label>
                    <input className="form-control" required value={form.student_number}
                      onChange={e => setForm({ ...form, student_number: e.target.value })} />
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
                    <label className="form-label">First Name *</label>
                    <input className="form-control" required value={form.first_name}
                      onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-control" required value={form.last_name}
                      onChange={e => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input className="form-control" type="date" value={form.date_of_birth}
                      onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={form.gender}
                      onChange={e => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Select...</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-control" type="email" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows={2} value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Register Student'}
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
