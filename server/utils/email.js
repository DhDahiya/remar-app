const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const SENDER = { name: 'REMAR Schweiz', email: 'dahiya.dhruv@gmail.com' };

async function sendEmail(to, subject, html) {
  if (!process.env.BREVO_API_KEY) { console.error('BREVO_API_KEY is not set'); return; }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: SENDER, to: [{ email: to }], subject, htmlContent: html }),
  });
  const data = await res.json();
  console.log('Brevo result:', JSON.stringify(data));
}

async function sendVerificationEmail(to, token) {
  const link = `${BASE_URL}/verify-email?token=${token}`;
  console.log(`Sending verification email to ${to}`);
  await sendEmail(to, 'Verify your REMAR account', `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#3a6b00">Welcome to REMAR Schweiz</h2>
      <p>Thank you for registering. Please verify your email address to activate your account.</p>
      <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#3a6b00;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
        Verify Email
      </a>
      <p style="color:#888;font-size:13px">This link expires in 24 hours. If you did not register, ignore this email.</p>
    </div>
  `);
}

async function sendPasswordResetEmail(to, token) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await sendEmail(to, 'Reset your REMAR password', `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#3a6b00">Password Reset</h2>
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#3a6b00;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
        Reset Password
      </a>
      <p style="color:#888;font-size:13px">This link expires in 1 hour. If you did not request this, ignore this email.</p>
    </div>
  `);
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
