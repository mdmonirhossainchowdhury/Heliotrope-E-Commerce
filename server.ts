import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory OTP storage (for demo purposes)
  const otps = new Map<string, { otp: string; expires: number }>();

  // API Routes
  app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP for 5 minutes
    otps.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

    console.log(`[AUTH] OTP for ${email}: ${otp}`);

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Heliotrope <onboarding@resend.dev>',
          to: email,
          subject: 'Your Heliotrope Verification Code',
          html: `<strong>Welcome to Heliotrope!</strong><p>Your verification code is: <h1>${otp}</h1></p>`
        });
        return res.json({ success: true, message: 'OTP sent to email.' });
      } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send email.' });
      }
    } else {
      // Return OTP in response only if NO API KEY is set, for development
      return res.json({ 
        success: true, 
        message: 'Dev Mode: OTP generated.',
        dev_otp: otp 
      });
    }
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const stored = otps.get(email);

    if (stored && stored.otp === otp && stored.expires > Date.now()) {
      otps.delete(email);
      return res.json({ success: true });
    }
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Heliotrope API is active' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.all('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
