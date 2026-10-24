import { hashPassword } from './auth.js';
import { createUserRepository } from './repositories/userRepository.js';
import { createVehicleRepository } from './repositories/vehicleRepository.js';

/** Showroom vehicles inserted into an empty database so the app is never blank. */
export const sampleVehicles = [
  { make: 'Aurelia', model: 'GT S', category: 'Coupe', year: 2025, price: 89400, quantity: 3, imageUrl: '/coupe.webp', description: 'Sculpted lines and exhilarating performance, crafted for the open road.' },
  { make: 'Northline', model: 'Summit X', category: 'SUV', year: 2025, price: 76200, quantity: 5, imageUrl: '/suv.webp', description: 'Space, presence, and a composed drive for every journey.' },
  { make: 'Eon', model: 'Lucent', category: 'Electric', year: 2026, price: 68500, quantity: 2, imageUrl: '/sedan.webp', description: 'Effortless electric travel with understated design.' },
  { make: 'Solenne', model: 'R8', category: 'Convertible', year: 2026, price: 112500, quantity: 2, imageUrl: '', description: 'Open-air performance with an effortless sense of occasion.' },
  { make: 'Vesper', model: 'S2', category: 'Sedan', year: 2026, price: 78500, quantity: 4, imageUrl: '', description: 'A grand touring sedan shaped around every journey.' },
  { make: 'Meridian', model: 'LX', category: 'SUV', year: 2026, price: 96300, quantity: 3, imageUrl: '', description: 'A generous cabin and quiet confidence in every season.' },
  { make: 'Eon', model: 'Arc', category: 'Electric', year: 2026, price: 82400, quantity: 3, imageUrl: '', description: 'Electric energy with the soul of a driver’s car.' },
];

export const DEFAULT_ADMIN = {
  name: 'Showroom Admin',
  email: (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
  password: process.env.ADMIN_INITIAL_PASSWORD || 'AdminPass123!',
};

/** Adds the expanded showroom once, including to databases created before it existed. */
export async function seedVehicles(db) {
  const vehicles = createVehicleRepository(db);
  await db.exec('CREATE TABLE IF NOT EXISTS seed_migrations (name TEXT PRIMARY KEY)');
  const migration = 'expanded-showroom-v1';
  if (await db.prepare('SELECT name FROM seed_migrations WHERE name = ?').get(migration)) return;
  const existing = await vehicles.list();
  for (const vehicle of sampleVehicles) {
    if (!existing.some((item) => item.make === vehicle.make && item.model === vehicle.model)) {
      await vehicles.create(vehicle, null);
    }
  }
  await db.prepare('INSERT INTO seed_migrations (name) VALUES (?)').run(migration);
}

/** Seeds a default admin account if not already present. */
export async function seedDefaultAdmin(db) {
  const users = createUserRepository(db);
  const existing = await users.findByEmailWithHash(DEFAULT_ADMIN.email);
  if (!existing) {
    await users.create({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      passwordHash: hashPassword(DEFAULT_ADMIN.password),
      role: 'admin',
    });
  }
}
