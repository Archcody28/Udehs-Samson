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

/**
 * Resolve the admin password hash.
 * Priority: MongoDB AdminCredentials (set via setup-admin) > env var ADMIN_PASSWORD_HASH.
 */
async function getAdminPasswordHash() {
  const credentials = await AdminCredentials.findOne();
  if (credentials && credentials.passwordHash) {
    return credentials.passwordHash;
  }
  return process.env.ADMIN_PASSWORD_HASH || null;
}

// TEMPORARY: POST /api/auth/setup-admin
// Emergency one-time endpoint to set admin password from Postman.
// Protected by X-Setup-Secret header matching ADMIN_SETUP_SECRET env var.
// REMOVE THIS ENDPOINT after initial provisioning.
router.post('/setup-admin', setupLimiter, async (req, res) => {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;

    // Require ADMIN_SETUP_SECRET to be configured
    if (!setupSecret) {
      return res.status(503).json({
        error: 'Setup endpoint is not enabled. Set ADMIN_SETUP_SECRET on the server.',
      });
    }

    // Validate X-Setup-Secret header
    const providedSecret = req.headers['x-setup-secret'];
    if (!providedSecret || providedSecret !== setupSecret) {
      return res.status(403).json({ error: 'Invalid or missing setup secret' });
    }

    const { password } = req.body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    // Hash the password using bcrypt with 12 salt rounds (same as generate-hash script)
    const passwordHash = await bcrypt.hash(password, 12);

    // Upsert the admin credentials document in MongoDB
    await AdminCredentials.findOneAndUpdate(
      {},
      { passwordHash, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Destroy all existing sessions (force re-login with new password)
    await Session.deleteMany({});

    res.json({
      success: true,
      message: 'Admin password configured successfully. Disable the setup endpoint now.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Setup failed' });
  }
});

// POST login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Resolve password hash from MongoDB or env var
    const adminPasswordHash = await getAdminPasswordHash();

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
