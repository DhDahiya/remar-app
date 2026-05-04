const express = require('express');
const db = require('../database/db');
const { authenticate, requireRole } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const router = express.Router();

const sendNotification = async (to, subject, text) => {
  if (!process.env.EMAIL_USER) return;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

// Get all assignments (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, t.title as task_title, v.name as volunteer_name, b.name as beneficiary_name
      FROM assignments a
      JOIN tasks t ON a.task_id = t.id
      JOIN volunteers v ON a.volunteer_id = v.id
      LEFT JOIN beneficiaries b ON a.beneficiary_id = b.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Volunteer applies for a task
router.post('/apply', authenticate, requireRole('volunteer'), async (req, res) => {
  const { task_id } = req.body;
  try {
    const volResult = await db.query('SELECT id FROM volunteers WHERE user_id = $1', [req.user.id]);
    if (!volResult.rows[0]) return res.status(400).json({ error: 'Volunteer profile not found' });
    const volunteer_id = volResult.rows[0].id;

    const taskResult = await db.query('SELECT status FROM tasks WHERE id = $1', [task_id]);
    if (!taskResult.rows[0]) return res.status(404).json({ error: 'Task not found' });
    if (taskResult.rows[0].status !== 'open') return res.status(400).json({ error: 'Task is not open for applications' });

    const existing = await db.query('SELECT id FROM assignments WHERE task_id = $1 AND volunteer_id = $2', [task_id, volunteer_id]);
    if (existing.rows[0]) return res.status(400).json({ error: 'Already applied for this task' });

    const result = await db.query(
      `INSERT INTO assignments (task_id, volunteer_id, assigned_by, status) VALUES ($1,$2,$3,'pending') RETURNING *`,
      [task_id, volunteer_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current volunteer's assignments
router.get('/my', authenticate, requireRole('volunteer'), async (req, res) => {
  try {
    const volResult = await db.query('SELECT id FROM volunteers WHERE user_id = $1', [req.user.id]);
    if (!volResult.rows[0]) return res.json([]);
    const result = await db.query(
      `SELECT a.*, t.title as task_title, t.location, t.scheduled_date
       FROM assignments a JOIN tasks t ON a.task_id = t.id
       WHERE a.volunteer_id = $1 ORDER BY a.created_at DESC`,
      [volResult.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create assignment (admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { task_id, volunteer_id, beneficiary_id, notes } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO assignments (task_id, volunteer_id, beneficiary_id, assigned_by, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [task_id, volunteer_id, beneficiary_id, req.user.id, notes]
    );

    // Update task status
    await db.query("UPDATE tasks SET status='assigned' WHERE id=$1", [task_id]);

    // Send notification
    const volUser = await db.query(
      'SELECT u.email FROM users u JOIN volunteers v ON u.id = v.user_id WHERE v.id = $1', [volunteer_id]
    );
    if (volUser.rows[0]) {
      await sendNotification(volUser.rows[0].email, 'REMAR: New Assignment', 'You have been assigned to a new volunteer opportunity. Please log in to view details.');
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Beneficiary approves or rejects a volunteer application
router.put('/:id/respond', authenticate, requireRole('beneficiary'), async (req, res) => {
  const { status } = req.body; // 'confirmed' or 'cancelled'
  if (!['confirmed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    // Ensure the task belongs to this beneficiary
    const check = await db.query(
      `SELECT a.id FROM assignments a
       JOIN tasks t ON a.task_id = t.id
       WHERE a.id = $1 AND t.created_by = $2`,
      [req.params.id, req.user.id]
    );
    if (!check.rows[0]) return res.status(403).json({ error: 'Not authorized' });

    const result = await db.query(
      'UPDATE assignments SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (status === 'confirmed') {
      await db.query("UPDATE tasks SET status='assigned' WHERE id=(SELECT task_id FROM assignments WHERE id=$1)", [req.params.id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending applications for beneficiary's tasks
router.get('/for-me', authenticate, requireRole('beneficiary'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, t.title as task_title, v.name as volunteer_name, v.phone as volunteer_phone
       FROM assignments a
       JOIN tasks t ON a.task_id = t.id
       JOIN volunteers v ON a.volunteer_id = v.id
       WHERE t.created_by = $1 AND a.status = 'pending'
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update assignment status (admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { status, notes } = req.body;
  try {
    const result = await db.query(
      'UPDATE assignments SET status=$1, notes=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
