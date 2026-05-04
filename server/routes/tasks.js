const express = require('express');
const db = require('../database/db');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task (admin or beneficiary)
router.post('/', authenticate, requireRole('admin', 'beneficiary'), async (req, res) => {
  const { title, description, required_skills, location, scheduled_date, duration_hours } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO tasks (title, description, created_by, required_skills, location, scheduled_date, duration_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, req.user.id, required_skills, location, scheduled_date, duration_hours]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', authenticate, requireRole('admin', 'beneficiary'), async (req, res) => {
  const { title, description, status, required_skills, location, scheduled_date, duration_hours } = req.body;
  try {
    const result = await db.query(
      `UPDATE tasks SET title=$1, description=$2, status=$3, required_skills=$4,
       location=$5, scheduled_date=$6, duration_hours=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [title, description, status, required_skills, location, scheduled_date, duration_hours, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task (admin only)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
