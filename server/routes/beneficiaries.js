const express = require('express');
const db = require('../database/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const router = express.Router();

// Get all beneficiaries (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM beneficiaries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single beneficiary
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM beneficiaries WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create beneficiary profile
router.post('/', authenticate, async (req, res) => {
  const { name, nickname, photo_url, voice_note_url, date_of_birth, age_group, gender,
    address, latitude, longitude, support_needs, time_preferences, phone, personality_notes } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO beneficiaries (user_id, name, nickname, photo_url, voice_note_url, date_of_birth,
        age_group, gender, address, latitude, longitude, support_needs, time_preferences, phone, personality_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [req.user.id, name, nickname, photo_url, voice_note_url, date_of_birth,
        age_group, gender, address, latitude, longitude, support_needs, time_preferences, phone, personality_notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update beneficiary profile
router.put('/:id', authenticate, async (req, res) => {
  const { name, nickname, photo_url, age_group, gender, address, support_needs, time_preferences, phone, personality_notes } = req.body;
  try {
    const result = await db.query(
      `UPDATE beneficiaries SET name=$1, nickname=$2, photo_url=$3, age_group=$4, gender=$5,
       address=$6, support_needs=$7, time_preferences=$8, phone=$9, personality_notes=$10
       WHERE id=$11 RETURNING *`,
      [name, nickname, photo_url, age_group, gender, address, support_needs, time_preferences, phone, personality_notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export beneficiaries as CSV
router.get('/export/csv', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT name, nickname, gender, age_group, address, phone, support_needs, created_at FROM beneficiaries');
    const filePath = path.join(__dirname, '../exports/beneficiaries.csv');
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'nickname', title: 'Nickname' },
        { id: 'gender', title: 'Gender' },
        { id: 'age_group', title: 'Age Group' },
        { id: 'address', title: 'Address' },
        { id: 'phone', title: 'Phone' },
        { id: 'support_needs', title: 'Support Needs' },
        { id: 'created_at', title: 'Registered' },
      ]
    });
    await csvWriter.writeRecords(result.rows);
    res.download(filePath, 'beneficiaries.csv');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
