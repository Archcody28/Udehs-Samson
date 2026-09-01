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
      // Generic error message — do not reveal whether password was wrong
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a cryptographically secure session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Store session server-side in MongoDB
    await Session.create({ token: sessionToken, role: 'admin' });

    // Set HTTP-only, Secure, SameSite cookie
    res.cookie('sid', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.sid;

    if (token) {
      // Remove session from database
      await Session.deleteOne({ token });
    }

    // Clear the cookie
    res.clearCookie('sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET check auth status
router.get('/check', async (req, res) => {
  try {
    const token = req.cookies?.sid;

    if (!token) {
      return res.json({ authenticated: false });
    }

    const session = await Session.findOne({ token });

    if (!session || session.role !== 'admin') {
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

export default router;