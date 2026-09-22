import Session from '../models/Session.js';

// Extract Bearer token from Authorization header
export function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

// Admin-only guard: validates the Bearer session token against the Session
// collection (stored as a SHA-256 hash). Expired sessions are removed by the
// MongoDB TTL index; expiresAt is also checked defensively.
export default async function requireAdmin(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const session = await Session.findOne({ tokenHash: Session.hashToken(token) });
    if (!session || (session.expiresAt && session.expiresAt.getTime() <= Date.now())) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication check failed' });
  }
}
