import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createDatabase } from './database.js';
import { createApp } from './app.js';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production.');
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.DATABASE_PATH || join(root, 'data', 'inventory.db');
mkdirSync(dirname(dbPath), { recursive: true });
const db = createDatabase(dbPath);

if (db.prepare('SELECT COUNT(*) AS count FROM vehicles').get().count === 0) {
  const insert = db.prepare('INSERT INTO vehicles (make, model, category, year, price, quantity, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  db.transaction(() => {
    insert.run('Aurelia', 'GT S', 'Coupe', 2025, 89400, 3, '/coupe.webp', 'Sculpted lines and exhilarating performance, crafted for the open road.');
    insert.run('Northline', 'Summit X', 'SUV', 2025, 76200, 5, '/suv.webp', 'Space, presence, and a composed drive for every journey.');
    insert.run('Eon', 'Lucent', 'Electric', 2026, 68500, 2, '/sedan.webp', 'Effortless electric travel with understated design.');
  })();
}

const app = createApp(db);
const dist = join(root, 'client', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false }));
  app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(join(dist, 'index.html'));
  });
}
const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Atelier Motors API listening on http://localhost:${port}`));
