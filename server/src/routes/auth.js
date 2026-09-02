import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import Session from '../models/Session.js';
import AdminCredentials from '../models/AdminCredentials.js';

const router = express.Router();

// Rate limit: max 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit: max 5 setup attempts per 15 minutes per IP
const setupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many setup attempts. Please try again later.' },
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

// POST /api/auth/setup-admin
// ONE-TIME admin account creation endpoint.
// Requires ADMIN_SETUP_ENABLED=true and X-Setup-Secret header.
// After successful setup, set ADMIN_SETUP_ENABLED=false and redeploy.
router.post('/setup-admin', setupLimiter, async (req, res) => {
  try {
    if (process.env.ADMIN_SETUP_ENABLED !== 'true') {
      return res.status(403).json({ error: 'Admin setup is disabled' });
    }
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (!setupSecret) {
      return res.status(503).json({ error: 'Setup endpoint not enabled' });
    }
    const providedSecret = req.headers['x-setup-secret'];
    if (!providedSecret || providedSecret !== setupSecret) {
      return res.status(403).json({ error: 'Invalid or missing setup secret' });
    }
    const { username, email, password } = req.body;
    if (!username || typeof username !== 'string' || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingAdmin = await AdminCredentials.findOne();
    if (existingAdmin) {
      return res.status(409).json({ error: 'Admin account already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await AdminCredentials.create({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'admin',
    });
    await Session.deleteMany({});
    res.json({
      success: true,
      message: 'Admin account created. Set ADMIN_SETUP_ENABLED=false and redeploy.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Setup failed' });
  }
});

// POST /api/auth/login
// Authenticate admin against MongoDB AdminCredentials.
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid request' });
    }
    const identifier = username || email;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: 'Username or email is required' });
    }
    const admin = await AdminCredentials.findOne({
      $or: [
        { username: identifier.trim().toLowerCase() },
        { email: identifier.trim().toLowerCase() },
      ],
    });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = Session.hashToken(sessionToken);
    await Session.create({
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.json({ authenticated: true, token: sessionToken });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/check - Validate Bearer token
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

// POST /api/auth/logout - Destroy session
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
