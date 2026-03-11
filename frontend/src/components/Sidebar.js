import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, Building2 } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
];

export default function Sidebar({ activePage, setPage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1><span>HRMS</span> Lite</h1>
        <p>Human Resource Management</p>
      </div>
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Navigation</p>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Building2 size={13} /> Admin Panel
        </p>
      </div>
    </aside>
  );
}
