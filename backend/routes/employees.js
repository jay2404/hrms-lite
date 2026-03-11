const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');

const router = express.Router();

// GET all employees
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM employees ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees', message: err.message });
  }
});

// GET single employee
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee', message: err.message });
  }
});

// POST create employee
router.post(
  '/',
  [
    body('employee_id').notEmpty().withMessage('Employee ID is required'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department').notEmpty().withMessage('Department is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employee_id, full_name, email, department } = req.body;

    try {
      // Check duplicate employee_id
      const dupEmpId = await pool.query(
        'SELECT id FROM employees WHERE employee_id = $1',
        [employee_id]
      );
      if (dupEmpId.rows.length > 0) {
        return res.status(409).json({ error: 'Employee ID already exists' });
      }

      // Check duplicate email
      const dupEmail = await pool.query(
        'SELECT id FROM employees WHERE email = $1',
        [email]
      );
      if (dupEmail.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const result = await pool.query(
        'INSERT INTO employees (employee_id, full_name, email, department) VALUES ($1, $2, $3, $4) RETURNING *',
        [employee_id, full_name, email, department]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create employee', message: err.message });
    }
  }
);

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee', message: err.message });
  }
});

// GET dashboard summary
router.get('/stats/summary', async (req, res) => {
  try {
    const empCount = await pool.query('SELECT COUNT(*) FROM employees');
    const deptCount = await pool.query('SELECT COUNT(DISTINCT department) FROM employees');
    const todayPresent = await pool.query(
      "SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE AND status = 'Present'"
    );
    const totalAttendance = await pool.query("SELECT COUNT(*) FROM attendance WHERE status = 'Present'");

    res.json({
      total_employees: parseInt(empCount.rows[0].count),
      total_departments: parseInt(deptCount.rows[0].count),
      present_today: parseInt(todayPresent.rows[0].count),
      total_present_days: parseInt(totalAttendance.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', message: err.message });
  }
});

module.exports = router;
