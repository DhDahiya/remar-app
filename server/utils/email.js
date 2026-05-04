const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) console.error('RESEND_API_KEY is not set');
const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function sendVerificationEmail(to, token) {
  const link = `${BASE_URL}/verify-email?token=${token}`;
  console.log(`Sending verification email to ${to}`);
  const result = await resend.emails.send({
    from: 'REMAR Schweiz <onboarding@resend.dev>',
    to,
    subject: 'Verify your REMAR account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#579500">Welcome to REMAR Schweiz</h2>
        <p>Thank you for registering. Please verify your email address to activate your account.</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#579500;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Verify Email
        </a>
        <p style="color:#888;font-size:13px">This link expires in 24 hours. If you did not register, ignore this email.</p>
      </div>
    `,
  });
  console.log('Verification email result:', JSON.stringify(result));
}

async function sendPasswordResetEmail(to, token) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: 'REMAR Schweiz <onboarding@resend.dev>',
    to,
    subject: 'Reset your REMAR password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#579500">Password Reset</h2>
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#579500;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px">This link expires in 1 hour. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
