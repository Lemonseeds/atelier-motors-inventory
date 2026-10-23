import express from 'express';
import { hashPassword, readToken, signToken, verifyPassword } from './auth.js';
import { vehicleById } from './database.js';

const fields = ['make', 'model', 'category', 'year', 'price', 'quantity', 'imageUrl', 'description'];
const textFields = ['make', 'model', 'category'];
const clean = (value) => typeof value === 'string' ? value.trim() : '';
const validId = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;

function validateVehicle(input, partial = false) {
  const result = {};
  for (const key of fields) {
    if (input[key] === undefined && partial) continue;
    result[key] = input[key];
  }
  for (const key of textFields) {
    if (key in result && (!clean(result[key]) || clean(result[key]).length > 80)) return `${key} must be 1–80 characters`;
    if (key in result) result[key] = clean(result[key]);
  }
  if ('year' in result && (!Number.isInteger(result.year) || result.year < 1900 || result.year > new Date().getFullYear() + 2)) return 'Enter a valid model year';
  if ('price' in result && (typeof result.price !== 'number' || !Number.isFinite(result.price) || result.price < 0)) return 'Price must be a non-negative number';
  if ('quantity' in result && (!Number.isInteger(result.quantity) || result.quantity < 0)) return 'Quantity must be a non-negative whole number';
  for (const key of ['imageUrl', 'description']) {
    if (key in result && result[key] != null && typeof result[key] !== 'string') return `${key} must be text`;
    if (key in result) result[key] = clean(result[key]);
  }
  if (result.imageUrl && !/^(https?:\/\/|\/[a-zA-Z0-9._/-]+$)/i.test(result.imageUrl)) return 'Image URL must be an http(s) URL or local asset path';
  if (result.description?.length > 2000) return 'Description is too long';
  return result;
}

export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  function requireAuth(req, res, next) {
    const claims = readToken((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
    const user = claims && db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(claims.sub);
    if (!user) return res.status(401).json({ error: 'Please sign in to continue.' });
    req.user = user;
    next();
  }

  function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    next();
  }

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/api/auth/register', (req, res) => {
    const name = clean(req.body?.name);
    const email = clean(req.body?.email).toLowerCase();
    const password = req.body?.password;
    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 10 || password.length > 128) {
      return res.status(400).json({ error: 'Enter a name, valid email, and password of at least 10 characters.' });
    }
    const role = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    try {
      const info = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(name, email, hashPassword(password), role);
      const user = { id: Number(info.lastInsertRowid), name, email, role };
      return res.status(201).json({ user, token: signToken(user) });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'An account with this email already exists.' });
      throw error;
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const email = clean(req.body?.email).toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || typeof req.body?.password !== 'string' || !verifyPassword(req.body.password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ user: publicUser, token: signToken(publicUser) });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.user }));

  function listVehicles(req, res) {
    const params = [];
    const clauses = [];
    const query = clean(req.query.q);
    if (query) { clauses.push('(make LIKE ? OR model LIKE ?)'); params.push(`%${query}%`, `%${query}%`); }
    for (const key of ['make', 'model', 'category']) {
      const value = clean(req.query[key]);
      if (value) { clauses.push(`${key} LIKE ?`); params.push(`%${value}%`); }
    }
    for (const [key, operator] of [['minPrice', '>='], ['maxPrice', '<=']]) {
      if (req.query[key] !== undefined && req.query[key] !== '') {
        const value = Number(req.query[key]);
        if (!Number.isFinite(value) || value < 0) return res.status(400).json({ error: 'Enter a valid price range.' });
        clauses.push(`price ${operator} ?`);
        params.push(value);
      }
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = db.prepare(`SELECT id FROM vehicles ${where} ORDER BY created_at DESC, id DESC`).all(...params);
    res.json({ vehicles: rows.map((row) => vehicleById(db, row.id)) });
  }

  app.get('/api/vehicles', requireAuth, listVehicles);
  app.get('/api/vehicles/search', requireAuth, listVehicles);
  app.post('/api/vehicles', requireAuth, (req, res) => {
    const value = validateVehicle(req.body || {});
    if (typeof value === 'string') return res.status(400).json({ error: value });
    const info = db.prepare(`INSERT INTO vehicles (make, model, category, year, price, quantity, image_url, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(value.make, value.model, value.category, value.year, value.price, value.quantity, value.imageUrl || '', value.description || '', req.user.id);
    res.status(201).json({ vehicle: vehicleById(db, Number(info.lastInsertRowid)) });
  });

  app.put('/api/vehicles/:id', requireAuth, (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid vehicle ID.' });
    const existing = vehicleById(db, Number(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Vehicle not found.' });
    if (req.user.role !== 'admin' && req.user.id !== existing.createdBy) return res.status(403).json({ error: 'You can only edit vehicles you added.' });
    const value = validateVehicle(req.body || {}, true);
    if (typeof value === 'string' || Object.keys(value).length === 0) return res.status(400).json({ error: typeof value === 'string' ? value : 'No details supplied.' });
    const columns = { imageUrl: 'image_url' };
    const entries = Object.entries(value);
    db.prepare(`UPDATE vehicles SET ${entries.map(([key]) => `${columns[key] || key} = ?`).join(', ')} WHERE id = ?`).run(...entries.map(([, val]) => val), existing.id);
    res.json({ vehicle: vehicleById(db, existing.id) });
  });

  app.delete('/api/vehicles/:id', requireAuth, requireAdmin, (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid vehicle ID.' });
    const info = db.prepare('DELETE FROM vehicles WHERE id = ?').run(Number(req.params.id));
    if (!info.changes) return res.status(404).json({ error: 'Vehicle not found.' });
    res.status(204).end();
  });

  app.post('/api/vehicles/:id/purchase', requireAuth, (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid vehicle ID.' });
    const id = Number(req.params.id);
    const info = db.prepare('UPDATE vehicles SET quantity = quantity - 1 WHERE id = ? AND quantity > 0').run(id);
    if (!info.changes) return res.status(vehicleById(db, id) ? 409 : 404).json({ error: vehicleById(db, id) ? 'This vehicle is sold out.' : 'Vehicle not found.' });
    res.json({ vehicle: vehicleById(db, id) });
  });

  app.post('/api/vehicles/:id/restock', requireAuth, requireAdmin, (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid vehicle ID.' });
    const quantity = req.body?.quantity;
    if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: 'Quantity must be a positive whole number.' });
    const id = Number(req.params.id);
    const info = db.prepare('UPDATE vehicles SET quantity = quantity + ? WHERE id = ?').run(quantity, id);
    if (!info.changes) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json({ vehicle: vehicleById(db, id) });
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Invalid JSON.' });
    console.error(error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });
  return app;
}
