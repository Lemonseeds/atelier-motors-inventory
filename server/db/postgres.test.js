import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { PGlite } from '@electric-sql/pglite';
import { createApp } from '../app.js';
import { createPostgresAdapter } from './postgres.js';

/**
 * Runs the API against a real PostgreSQL engine (PGlite, Postgres compiled to WASM)
 * to prove the SQL used in production on Render is valid PostgreSQL.
 */
let pglite;
let app;

before(async () => {
  pglite = new PGlite();
  const client = {
    async query(text, params = []) {
      const result = params.length ? await pglite.query(text, params) : (await pglite.exec(text)).at(-1);
      return { rows: result?.rows ?? [], rowCount: result?.affectedRows ?? 0 };
    },
    end: () => pglite.close(),
  };
  app = createApp(await createPostgresAdapter(client));
});
after(() => pglite.close());

test('PostgreSQL: register, duplicate email, add, case-insensitive search, purchase until sold out', async () => {
  const account = { name: 'Pat', email: 'pat@example.com', password: 'StrongPass123!' };
  const registered = await request(app).post('/api/auth/register').send(account);
  assert.equal(registered.status, 201);
  assert.equal((await request(app).post('/api/auth/register').send(account)).status, 409);

  const auth = { Authorization: `Bearer ${registered.body.token}` };
  const created = await request(app).post('/api/vehicles').set(auth).send({ make: 'Aurelia', model: 'GT_S', category: 'Coupe', year: 2025, price: 89400, quantity: 1 });
  assert.equal(created.status, 201);
  assert.equal(created.body.vehicle.price, 89400);

  const found = await request(app).get('/api/vehicles/search?q=aurelia gt&category=COUPE&minPrice=1000').set(auth);
  assert.equal(found.body.vehicles.length, 1);
  const wildcard = await request(app).get('/api/vehicles/search?model=G%25').set(auth);
  assert.equal(wildcard.body.vehicles.length, 0, '% is matched literally, not as a wildcard');

  const id = created.body.vehicle.id;
  assert.equal((await request(app).post(`/api/vehicles/${id}/purchase`).set(auth)).body.vehicle.quantity, 0);
  assert.equal((await request(app).post(`/api/vehicles/${id}/purchase`).set(auth)).status, 409);
  assert.equal((await request(app).put(`/api/vehicles/${id}`).set(auth).send({ price: 80000 })).body.vehicle.price, 80000);
});
