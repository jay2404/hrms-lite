import React, { useEffect, useState } from 'react';
import { Plus, CalendarCheck, X, Filter, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployees, getAttendance, markAttendance, deleteAttendance } from '../api';

const today = new Date().toISOString().split('T')[0];

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee_id: '', date: today, status: 'Present' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [filterEmp, setFilterEmp] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      getAttendance({ employee_id: filterEmp || undefined, date: filterDate || undefined }),
      getEmployees(),
    ])
      .then(([att, emp]) => { setRecords(att.data); setEmployees(emp.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [filterEmp, filterDate]); // eslint-disable-line

  const validate = () => {
    const e = {};
    if (!form.employee_id) e.employee_id = 'Select an employee';
    if (!form.date) e.date = 'Select a date';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await markAttendance(form);
      toast.success('Attendance marked!');
      setShowModal(false);
      setForm({ employee_id: '', date: today, status: 'Present' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    setDeletingId(id);
    try {
      await deleteAttendance(id);
      toast.success('Record deleted');
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Attendance</h2>
        <p>Track and manage daily attendance records</p>
      </div>
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="filter-bar">
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
                <option value="">All Employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name}</option>
                ))}
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              {(filterEmp || filterDate) && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setFilterEmp(''); setFilterDate(''); }}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setErrors({}); }}>
            <Plus size={16} /> Mark Attendance
          </button>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-state"><div className="spinner" /> Loading records...</div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck />
              <h4>No attendance records</h4>
              <p>Start by marking attendance for your employees</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Emp ID</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="employee-cell">
                          <div className="avatar">{r.full_name.charAt(0)}</div>
                          <span style={{ fontWeight: 600 }}>{r.full_name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {r.emp_code}
                      </td>
                      <td><span className="badge-dept">{r.department}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`badge ${r.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                          {r.status === 'Present' ? '✓' : '✗'} {r.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Mark Attendance</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Employee *</label>
              <select
                className="form-select"
                value={form.employee_id}
                onChange={(e) => { setForm({ ...form, employee_id: e.target.value }); setErrors({ ...errors, employee_id: '' }); }}
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
                ))}
              </select>
              {errors.employee_id && <p className="form-error">{errors.employee_id}</p>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date}
                  onChange={(e) => { setForm({ ...form, date: e.target.value }); setErrors({ ...errors, date: '' }); }}
                />
                {errors.date && <p className="form-error">{errors.date}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            <div style={{ 
              padding: '12px 16px', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)'
            }}>
              💡 If attendance for this employee on this date already exists, it will be updated.
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Mark Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
