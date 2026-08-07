const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const createTransporter = () => {
  if (process.env.NODE_ENV === 'test') return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER) {
    logger.warn('[Email] EMAIL_USER not configured — skipping email send');
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Supply Chain Control Tower" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html || `<p>${text}</p>`,
    });
    logger.info(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`[Email] Failed to send to ${to}: ${err.message}`);
  }
};

module.exports = { sendEmail };
