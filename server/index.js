import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openDatabase } from './db/index.js';
import { seedVehicles } from './seed.js';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production.');
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const db = await openDatabase({
  databaseUrl: process.env.DATABASE_URL,
  databasePath: process.env.DATABASE_PATH || join(root, 'data', 'inventory.db'),
});
await seedVehicles(db);

const app = createApp(db, { clientDist: join(root, 'client', 'dist') });
const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Atelier Motors API listening on http://localhost:${port}`));
