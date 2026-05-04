const express = require('express');
const db = require('../database/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const router = express.Router();

// Get all volunteers (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM volunteers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current volunteer's own profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM volunteers WHERE user_id = $1', [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Profile not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single volunteer
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM volunteers WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create volunteer profile
router.post('/', authenticate, async (req, res) => {
  const { name, nickname, photo_url, voice_note_url, date_of_birth, age_group, gender,
    address, latitude, longitude, skills, availability, phone, personality_notes } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO volunteers (user_id, name, nickname, photo_url, voice_note_url, date_of_birth,
        age_group, gender, address, latitude, longitude, skills, availability, phone, personality_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [req.user.id, name, nickname, photo_url, voice_note_url, date_of_birth,
        age_group, gender, address, latitude, longitude, skills, availability, phone, personality_notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update volunteer profile
router.put('/:id', authenticate, async (req, res) => {
  const { name, nickname, photo_url, age_group, gender, address, skills, availability, phone, personality_notes } = req.body;
  try {
    const result = await db.query(
      `UPDATE volunteers SET name=$1, nickname=$2, photo_url=$3, age_group=$4, gender=$5,
       address=$6, skills=$7, availability=$8, phone=$9, personality_notes=$10
       WHERE id=$11 RETURNING *`,
      [name, nickname, photo_url, age_group, gender, address, skills, availability, phone, personality_notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export volunteers as CSV
router.get('/export/csv', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT name, nickname, gender, age_group, address, phone, skills, created_at FROM volunteers');
    const filePath = path.join(__dirname, '../exports/volunteers.csv');
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'nickname', title: 'Nickname' },
        { id: 'gender', title: 'Gender' },
        { id: 'age_group', title: 'Age Group' },
        { id: 'address', title: 'Address' },
        { id: 'phone', title: 'Phone' },
        { id: 'skills', title: 'Skills' },
        { id: 'created_at', title: 'Registered' },
      ]
    });
    await csvWriter.writeRecords(result.rows);
    res.download(filePath, 'volunteers.csv');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
