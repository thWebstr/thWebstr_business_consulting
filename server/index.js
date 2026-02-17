require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Create transporter once and verify on startup for clearer diagnostics
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

transporter.verify().then(() => {
  console.log('SMTP transporter verified — ready to send emails');
}).catch(err => {
  console.error('SMTP transporter verification failed. Check SMTP settings in .env:', err && err.message ? err.message : err);
});

// POST /api/contact
app.post('/api/contact', async (req, res) => {
  try {
    const { fullName, email, specialty, currentWebsite, outcome } = req.body || {};

    if (!fullName || !email || !specialty || !outcome) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const target = process.env.TARGET_EMAIL || 'thewebstr25@gmail.com';

    const mailOptions = {
      from: `${fullName} <${email}>`,
      to: target,
      subject: `New contact from website — ${fullName}`,
      text: `Name: ${fullName}\nEmail: ${email}\nSpecialty: ${specialty}\nWebsite: ${currentWebsite || 'N/A'}\n\nOutcome:\n${outcome}`,
      html: `<p><strong>Name:</strong> ${fullName}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Specialty:</strong> ${specialty}</p>
             <p><strong>Website:</strong> ${currentWebsite || 'N/A'}</p>
             <hr>
             <p><strong>Outcome:</strong></p>
             <p>${outcome.replace(/\n/g, '<br>')}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info && info.messageId ? info.messageId : info);

    return res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error sending contact email', err && err.message ? err.message : err);
    // Return the error message to the client for debugging (safe to remove in production)
    return res.status(500).json({ error: 'Failed to send message', details: err && err.message ? err.message : String(err) });
  }
});

app.listen(PORT, () => console.log(`Contact API listening on port ${PORT}`));
