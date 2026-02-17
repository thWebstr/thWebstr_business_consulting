Setup & Run

1. Copy `.env.example` to `.env` and fill SMTP credentials and TARGET_EMAIL.

2. Install dependencies:

```bash
cd server
npm install
```

1. Start server (development):

```bash
npm run dev
```

Or production:

```bash
npm start
```

Notes

- Use a transactional SMTP provider (SendGrid, Mailgun, MailerSend, or your host SMTP) for reliable delivery.
- The API exposes `POST /api/contact` and accepts JSON with `fullName,email,specialty,currentWebsite,outcome`.
- Keep SMTP credentials secret and don't commit `.env` to source control.
