const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');

const router = express.Router();

// GET attendance records - all or filtered by employee
router.get('/', async (req, res) => {
  const { employee_id, date } = req.query;

  try {
    let query = `
      SELECT a.*, e.full_name, e.employee_id as emp_code, e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
    `;
    const params = [];
    const conditions = [];

    if (employee_id) {
      params.push(employee_id);
      conditions.push(`a.employee_id = $${params.length}`);
    }
    if (date) {
      params.push(date);
      conditions.push(`a.date = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance', message: err.message });
  }
});

// GET attendance stats per employee
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.full_name,
        e.employee_id as emp_code,
        e.department,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_days,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_days,
        COUNT(a.id) as total_marked
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id
      GROUP BY e.id, e.full_name, e.employee_id, e.department
      ORDER BY e.full_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', message: err.message });
  }
});

// POST mark attendance
router.post(
  '/',
  [
    body('employee_id').notEmpty().withMessage('Employee ID is required'),
    body('date').isDate().withMessage('Valid date is required'),
    body('status').isIn(['Present', 'Absent']).withMessage('Status must be Present or Absent'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employee_id, date, status } = req.body;

    try {
      // Check employee exists
      const emp = await pool.query('SELECT id FROM employees WHERE id = $1', [employee_id]);
      if (emp.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Upsert attendance
      const result = await pool.query(
        `INSERT INTO attendance (employee_id, date, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (employee_id, date)
         DO UPDATE SET status = EXCLUDED.status
         RETURNING *`,
        [employee_id, date, status]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark attendance', message: err.message });
    }
  }
);

// DELETE attendance record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM attendance WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete attendance', message: err.message });
  }
});

module.exports = router;
