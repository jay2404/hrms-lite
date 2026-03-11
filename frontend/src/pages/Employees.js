import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Search, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployees, createEmployee, deleteEmployee } from '../api';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Legal'];

const defaultForm = { employee_id: '', full_name: '', email: '', department: '' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchEmployees = () => {
    setLoading(true);
    getEmployees()
      .then((r) => setEmployees(r.data))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const validate = () => {
    const e = {};
    if (!form.employee_id.trim()) e.employee_id = 'Required';
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.department) e.department = 'Required';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await createEmployee(form);
      toast.success('Employee added successfully!');
      setShowModal(false);
      setForm(defaultForm);
      setErrors({});
      fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add employee';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteEmployee(id);
      toast.success('Employee removed');
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch {
      toast.error('Failed to delete employee');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h2>Employees</h2>
        <p>Manage your workforce — {employees.length} total employee{employees.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-wrap">
              <Search />
              <input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}); }}>
            <Plus size={16} /> Add Employee
          </button>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-state"><div className="spinner" /> Loading employees...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Users />
              <h4>{search ? 'No results found' : 'No employees yet'}</h4>
              <p>{search ? 'Try a different search term' : 'Add your first employee to get started'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div className="employee-cell">
                          <div className="avatar">{emp.full_name.charAt(0)}</div>
                          <span style={{ fontWeight: 600 }}>{emp.full_name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {emp.employee_id}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                      <td><span className="badge-dept">{emp.department}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(emp.id, emp.full_name)}
                          disabled={deletingId === emp.id}
                        >
                          <Trash2 size={14} />
                          {deletingId === emp.id ? 'Deleting...' : 'Delete'}
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
              <h3>Add New Employee</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input
                  className="form-input"
                  placeholder="e.g. EMP-001"
                  value={form.employee_id}
                  onChange={(e) => { setForm({ ...form, employee_id: e.target.value }); setErrors({ ...errors, employee_id: '' }); }}
                />
                {errors.employee_id && <p className="form-error">{errors.employee_id}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Jane Smith"
                  value={form.full_name}
                  onChange={(e) => { setForm({ ...form, full_name: e.target.value }); setErrors({ ...errors, full_name: '' }); }}
                />
                {errors.full_name && <p className="form-error">{errors.full_name}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                className="form-input"
                placeholder="jane@company.com"
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={form.department}
                onChange={(e) => { setForm({ ...form, department: e.target.value }); setErrors({ ...errors, department: '' }); }}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="form-error">{errors.department}</p>}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
