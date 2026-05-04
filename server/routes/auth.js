const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const result = await db.query(
      'INSERT INTO users (email, password_hash, role, is_verified, verification_token) VALUES ($1, $2, $3, FALSE, $4) RETURNING id, email, role',
      [email, hash, role, verificationToken]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken).catch(err => console.error('Email error:', err.message));

    res.json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id',
      [req.params.token]
    );
    if (result.rowCount === 0) return res.status(400).json({ error: 'Invalid or expired verification link' });
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Email not found' });
    if (user.is_verified) return res.status(400).json({ error: 'Email already verified' });

    const token = crypto.randomBytes(32).toString('hex');
    await db.query('UPDATE users SET verification_token = $1 WHERE id = $2', [token, user.id]);
    sendVerificationEmail(email, token).catch(err => console.error('Email error:', err.message));
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.is_verified) return res.status(403).json({ error: 'Please verify your email before logging in', unverified: true });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    // Always respond with success to avoid exposing whether email exists
    if (!user) return res.json({ message: 'If that email is registered, a reset link has been sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [token, expires, user.id]);
    sendPasswordResetEmail(email, token).catch(err => console.error('Email error:', err.message));
    res.json({ message: 'If that email is registered, a reset link has been sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [req.params.token]
    );
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hash, user.id]
    );
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
