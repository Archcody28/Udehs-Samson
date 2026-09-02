import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import Session from '../models/Session.js';

const router = express.Router();

// Rate limit: max 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Extract Bearer token from Authorization header
function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

// POST login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      return res.status(500).json({ error: 'Admin authentication not configured' });
    }

    // Secure password comparison using bcrypt
    const isValid = await bcrypt.compare(password, adminPasswordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a cryptographically secure session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing in MongoDB
    const tokenHash = Session.hashToken(sessionToken);

    // Store session with expiration (24 hours)
    await Session.create({
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.json({ authenticated: true, token: sessionToken });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET check auth status
router.get('/check', async (req, res) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.json({ authenticated: false });
    }

    const tokenHash = Session.hashToken(token);
    const session = await Session.findOne({ tokenHash });

    if (!session) {
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

// POST logout
router.post('/logout', async (req, res) => {
  try {
    const token = extractBearerToken(req);

    if (token) {
      const tokenHash = Session.hashToken(token);
      await Session.deleteOne({ tokenHash });
    }

    res.json({ authenticated: false });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
