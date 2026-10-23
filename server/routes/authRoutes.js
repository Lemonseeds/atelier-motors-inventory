import { Router } from 'express';
import { hashPassword, signToken, verifyPassword } from '../auth.js';
import { DuplicateEmailError, toPublicUser } from '../repositories/userRepository.js';
import { validateRegistration } from '../validation.js';

/** Users registering with ADMIN_EMAIL become admins; everyone else is a regular user. */
function roleFor(email) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return adminEmail && email === adminEmail ? 'admin' : 'user';
}

/** POST /register, POST /login, GET /me */
export function createAuthRouter({ users, requireAuth }) {
  const router = Router();

  router.post('/register', async (req, res) => {
    const { value, error } = validateRegistration(req.body);
    if (error) return res.status(400).json({ error });
    try {
      const user = await users.create({
        name: value.name,
        email: value.email,
        passwordHash: hashPassword(value.password),
        role: roleFor(value.email),
      });
      res.status(201).json({ user, token: signToken(user) });
    } catch (err) {
      if (err instanceof DuplicateEmailError) return res.status(409).json({ error: err.message });
      throw err;
    }
  });

  router.post('/login', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;
    const row = email && await users.findByEmailWithHash(email);
    if (!row || typeof password !== 'string' || !verifyPassword(password, row.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const user = toPublicUser(row);
    res.json({ user, token: signToken(user) });
  });

  router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

  return router;
}
