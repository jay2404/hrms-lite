import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Employees
export const getEmployees = () => api.get('/employees');
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const createEmployee = (data) => api.post('/employees', data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
export const getSummaryStats = () => api.get('/employees/stats/summary');

// Attendance
export const getAttendance = (params) => api.get('/attendance', { params });
export const getAttendanceStats = () => api.get('/attendance/stats');
export const markAttendance = (data) => api.post('/attendance', data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

export default api;
