const nodemailer = require('nodemailer');
const User = require('../models/User');

async function sendTicketStatusEmail({ toEmail, ticketTitle, oldStatus, newStatus }) {
  const subject = `Request updated: ${ticketTitle}`;
  const text = `The status of your request "${ticketTitle}" changed from "${oldStatus}" to "${newStatus}".`;

  if (!process.env.SMTP_HOST) {
    console.log(`[email] SMTP not configured. ${subject} → ${toEmail}`);
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
  const base = (process.env.PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text: `${text}\n\nView updates in the app: ${base}`,
    html: `<p>${text}</p><p><a href="${base}">Open app</a></p>`,
  });
}

/** Notify ticket creator when status changes */
async function notifyStatusChangeIfNeeded(ticket, previousStatus) {
  if (!ticket || previousStatus === ticket.status) return;
  const client = await User.findById(ticket.createdBy).select('email name');
  if (!client?.email) return;
  await sendTicketStatusEmail({
    toEmail: client.email,
    ticketTitle: ticket.title,
    oldStatus: previousStatus,
    newStatus: ticket.status,
  });
}

module.exports = { sendTicketStatusEmail, notifyStatusChangeIfNeeded };
