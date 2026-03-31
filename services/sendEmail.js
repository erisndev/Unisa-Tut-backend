const nodemailer = require("nodemailer");

/**
 * Send an email using SMTP.
 *
 * Required env vars:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - SMTP_FROM (optional, defaults to SMTP_USER)
 */
module.exports = async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error("Missing 'to' email");
  if (!subject) throw new Error("Missing 'subject'");
  if (!html && !text) throw new Error("Missing 'html' or 'text'");

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    throw new Error("SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
