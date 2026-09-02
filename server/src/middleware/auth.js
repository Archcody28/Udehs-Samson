import Session from '../models/Session.js';

/**
 * Middleware to verify authentication and admin authorization.
 * Expects a valid session token in the Authorization: Bearer <token> header.
 */
export async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = header.slice(7).trim();
    const tokenHash = Session.hashToken(token);
    const session = await Session.findOne({ tokenHash });

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.session = session;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
