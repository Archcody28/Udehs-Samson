import Session from '../models/Session.js';

/**
 * Middleware to verify authentication and admin authorization.
 * Expects a valid session token in the `sid` HTTP-only cookie.
 */
export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.sid;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = await Session.findOne({ token });

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    if (session.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.session = session;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
}