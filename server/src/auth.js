const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'bridgetech-dev-secret-change-in-prod';
const EXPIRES_IN = '7d';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, name: user.name },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/** Express middleware: requires a valid bearer token. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Express middleware: requires an authenticated admin user. */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

module.exports = { signToken, verifyToken, requireAuth, requireAdmin };
