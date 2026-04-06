const nodemailer = require('nodemailer');

async function sendPasswordResetEmail(to, resetToken) {
  const base = (process.env.PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const url = `${base}/reset-password.html?token=${encodeURIComponent(resetToken)}`;

  if (!process.env.SMTP_HOST) {
    console.log(`[email] SMTP not configured. Password reset link for ${to}: ${url}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@localhost';

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your TechServe password',
    text: `Reset your password using this link (expires in 1 hour):\n${url}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Reset your password using the link below (expires in 1 hour):</p><p><a href="${url}">${url}</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
}

module.exports = { sendPasswordResetEmail };
