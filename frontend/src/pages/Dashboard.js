import React, { useEffect, useState } from 'react';
import { Users, CalendarCheck, Building2, TrendingUp, ChevronRight } from 'lucide-react';
import { getSummaryStats, getAttendanceStats } from '../api';

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState(null);
  const [attStats, setAttStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSummaryStats(), getAttendanceStats()])
      .then(([s, a]) => { setStats(s.data); setAttStats(a.data.slice(0, 5)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Employees', value: stats.total_employees, icon: Users, color: 'blue' },
    { label: 'Departments', value: stats.total_departments, icon: Building2, color: 'purple' },
    { label: 'Present Today', value: stats.present_today, icon: CalendarCheck, color: 'green' },
    { label: 'Total Present Days', value: stats.total_present_days, icon: TrendingUp, color: 'yellow' },
  ] : [];

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your workforce and attendance metrics</p>
      </div>
      <div className="page-content">
        {loading ? (
          <div className="loading-state"><div className="spinner" /> Loading metrics...</div>
        ) : (
          <>
            <div className="stats-grid">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <div className="stat-card" key={label}>
                  <div className={`stat-icon ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{value}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title">
                Attendance Summary <span>— top employees</span>
              </div>
              {attStats.length === 0 ? (
                <div className="empty-state">
                  <CalendarCheck />
                  <h4>No attendance data</h4>
                  <p>Start marking attendance to see stats here</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Present Days</th>
                        <th>Absent Days</th>
                        <th>Total Marked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attStats.map((e) => (
                        <tr key={e.id}>
                          <td>
                            <div className="employee-cell">
                              <div className="avatar">{e.full_name.charAt(0)}</div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{e.full_name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.emp_code}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge-dept">{e.department}</span></td>
                          <td><span className="badge badge-present">✓ {e.present_days}</span></td>
                          <td><span className="badge badge-absent">✗ {e.absent_days}</span></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{e.total_marked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage('employees')}>
                  <Users size={14} /> View Employees <ChevronRight size={14} />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage('attendance')}>
                  <CalendarCheck size={14} /> Manage Attendance <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
