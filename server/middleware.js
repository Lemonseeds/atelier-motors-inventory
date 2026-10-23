import { readToken } from './auth.js';

/**
 * Builds middleware that requires a valid bearer token and loads the current
 * user from the database (so deleted users or role changes take effect at once).
 */
export function createRequireAuth(users) {
  return async function requireAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const claims = readToken(token);
    const user = claims && await users.findById(claims.sub);
    if (!user) return res.status(401).json({ error: 'Please sign in to continue.' });
    req.user = user;
    next();
  };
}

/** Must run after requireAuth. */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
}

/** Validates the :id route parameter and stores it as a number on req.vehicleId. */
export function parseVehicleId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid vehicle ID.' });
  req.vehicleId = id;
  next();
}
