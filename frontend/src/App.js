import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import './index.css';

function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />;
      case 'employees': return <Employees />;
      case 'attendance': return <Attendance />;
      default: return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div className="layout">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2330',
            color: '#f0f4ff',
            border: '1px solid #232838',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#0a0c10' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0a0c10' } },
        }}
      />
      <Sidebar activePage={page} setPage={setPage} />
      <main className="main">{renderPage()}</main>
    </div>
  );
}

export default App;
