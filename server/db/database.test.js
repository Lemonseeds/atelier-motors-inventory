import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toPostgresPlaceholders } from './postgres.js';
import { createSqliteDatabase } from './sqlite.js';
import { seedVehicles, sampleVehicles } from '../seed.js';
import { createVehicleRepository } from '../repositories/vehicleRepository.js';

test('toPostgresPlaceholders numbers each ? placeholder in order', () => {
  assert.equal(toPostgresPlaceholders('SELECT * FROM t WHERE a = ? AND b LIKE ?'), 'SELECT * FROM t WHERE a = $1 AND b LIKE $2');
  assert.equal(toPostgresPlaceholders('SELECT 1'), 'SELECT 1');
});

test('seedVehicles fills an empty inventory once and is idempotent', async () => {
  const db = createSqliteDatabase(':memory:');
  await seedVehicles(db);
  await seedVehicles(db);
  const vehicles = await createVehicleRepository(db).list({});
  assert.equal(vehicles.length, sampleVehicles.length);
  db.close();
});

test('vehicle repository search is case-insensitive and maps rows to camelCase', async () => {
  const db = createSqliteDatabase(':memory:');
  const repo = createVehicleRepository(db);
  const created = await repo.create({ make: 'Aurelia', model: 'GT S', category: 'Coupe', year: 2025, price: 100, quantity: 1, imageUrl: '/coupe.webp', description: '' }, null);
  assert.equal(created.imageUrl, '/coupe.webp');
  assert.equal((await repo.list({ make: 'AURELIA' })).length, 1);
  assert.equal((await repo.list({ category: 'coupe', maxPrice: 50 })).length, 0);
  assert.equal((await repo.purchase(created.id)).quantity, 0);
  assert.equal(await repo.purchase(created.id), null);
  assert.equal((await repo.restock(created.id, 4)).quantity, 4);
  assert.equal(await repo.remove(created.id), true);
  assert.equal(await repo.remove(created.id), false);
  db.close();
});
