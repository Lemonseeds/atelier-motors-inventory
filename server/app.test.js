import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from './app.js';
import { createSqliteDatabase } from './db/sqlite.js';

let db;
let app;

before(() => {
  db = createSqliteDatabase(':memory:');
  app = createApp(db);
});
beforeEach(() => db.exec('DELETE FROM vehicles; DELETE FROM users;'));
after(() => db.close());

async function register(email = 'buyer@example.com', role = 'user') {
  const response = await request(app).post('/api/auth/register').send({ name: 'Taylor', email, password: 'StrongPass123!' });
  assert.equal(response.status, 201);
  if (role === 'admin') db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', email);
  const login = await request(app).post('/api/auth/login').send({ email, password: 'StrongPass123!' });
  return login.body.token;
}

async function addVehicle(token, overrides = {}) {
  return request(app).post('/api/vehicles').set('Authorization', `Bearer ${token}`).send({
    make: 'Porsche', model: '911 Carrera', category: 'Sports', year: 2024,
    price: 128500, quantity: 2, imageUrl: 'https://example.com/car.jpg',
    description: 'A modern icon.', ...overrides,
  });
}

test('register, log in, reject duplicate account and invalid credentials', async () => {
  const token = await register();
  assert.ok(token);
  assert.equal((await request(app).post('/api/auth/register').send({ name: 'Taylor', email: 'buyer@example.com', password: 'StrongPass123!' })).status, 409);
  assert.equal((await request(app).post('/api/auth/login').send({ email: 'buyer@example.com', password: 'wrong' })).status, 401);
  assert.equal((await request(app).get('/api/vehicles')).status, 401);
});

test('vehicle create validates data and search supports make, category and price range', async () => {
  const token = await register();
  assert.equal((await addVehicle(token, { price: -1 })).status, 400);
  assert.equal((await addVehicle(token)).status, 201);
  assert.equal((await addVehicle(token, { make: 'BMW', model: 'i4', category: 'Electric', price: 54000 })).status, 201);
  const results = await request(app).get('/api/vehicles/search?make=por&category=Sports&minPrice=100000&maxPrice=150000').set('Authorization', `Bearer ${token}`);
  assert.equal(results.status, 200);
  assert.equal(results.body.vehicles.length, 1);
  assert.equal(results.body.vehicles[0].model, '911 Carrera');
});

test('purchase atomically decreases stock and refuses a sold out vehicle', async () => {
  const token = await register();
  const created = await addVehicle(token, { quantity: 1 });
  const id = created.body.vehicle.id;
  const first = await request(app).post(`/api/vehicles/${id}/purchase`).set('Authorization', `Bearer ${token}`);
  const second = await request(app).post(`/api/vehicles/${id}/purchase`).set('Authorization', `Bearer ${token}`);
  assert.equal(first.status, 200);
  assert.equal(first.body.vehicle.quantity, 0);
  assert.equal(second.status, 409);
  assert.equal(db.prepare('SELECT quantity FROM vehicles WHERE id = ?').get(id).quantity, 0);
});

test('only admins may restock or delete; owner can update a vehicle', async () => {
  const user = await register();
  const admin = await register('admin@example.com', 'admin');
  const id = (await addVehicle(user)).body.vehicle.id;
  assert.equal((await request(app).post(`/api/vehicles/${id}/restock`).set('Authorization', `Bearer ${user}`).send({ quantity: 3 })).status, 403);
  assert.equal((await request(app).delete(`/api/vehicles/${id}`).set('Authorization', `Bearer ${user}`)).status, 403);
  assert.equal((await request(app).put(`/api/vehicles/${id}`).set('Authorization', `Bearer ${user}`).send({ price: 125000 })).status, 200);
  assert.equal((await request(app).post(`/api/vehicles/${id}/restock`).set('Authorization', `Bearer ${admin}`).send({ quantity: 3 })).body.vehicle.quantity, 5);
  assert.equal((await request(app).delete(`/api/vehicles/${id}`).set('Authorization', `Bearer ${admin}`)).status, 204);
});

test('rejects forged tokens, invalid stock changes, and editing another user’s listing', async () => {
  const owner = await register();
  const other = await register('other@example.com');
  const admin = await register('manager@example.com', 'admin');
  const id = (await addVehicle(owner)).body.vehicle.id;
  assert.equal((await request(app).get('/api/vehicles').set('Authorization', `Bearer ${owner}tampered`)).status, 401);
  assert.equal((await request(app).put(`/api/vehicles/${id}`).set('Authorization', `Bearer ${other}`).send({ price: 1 })).status, 403);
  assert.equal((await request(app).post(`/api/vehicles/${id}/restock`).set('Authorization', `Bearer ${admin}`).send({ quantity: -2 })).status, 400);
  assert.equal((await request(app).post('/api/vehicles/999999/purchase').set('Authorization', `Bearer ${owner}`)).status, 404);
});

test('combined make/model query returns only matching vehicles', async () => {
  const token = await register();
  await addVehicle(token);
  await addVehicle(token, { make: 'Aurelia', model: 'Lucent', category: 'Electric' });
  const result = await request(app).get('/api/vehicles/search?q=Aurelia').set('Authorization', `Bearer ${token}`);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.vehicles.map((vehicle) => vehicle.model), ['Lucent']);
});

test('GET /api/vehicles lists every vehicle and search filters by model', async () => {
  const token = await register();
  await addVehicle(token);
  await addVehicle(token, { make: 'BMW', model: 'i4', category: 'Electric' });
  const all = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${token}`);
  assert.equal(all.body.vehicles.length, 2);
  const byModel = await request(app).get('/api/vehicles/search?model=I4').set('Authorization', `Bearer ${token}`);
  assert.deepEqual(byModel.body.vehicles.map((v) => v.make), ['BMW']);
});

test('search rejects an invalid or inverted price range', async () => {
  const token = await register();
  const auth = { Authorization: `Bearer ${token}` };
  assert.equal((await request(app).get('/api/vehicles/search?minPrice=abc').set(auth)).status, 400);
  assert.equal((await request(app).get('/api/vehicles/search?minPrice=500&maxPrice=100').set(auth)).status, 400);
});

test('registration validates input and grants admin only to ADMIN_EMAIL', async () => {
  assert.equal((await request(app).post('/api/auth/register').send({ name: 'A', email: 'bad', password: 'StrongPass123!' })).status, 400);
  process.env.ADMIN_EMAIL = 'Boss@Example.com';
  try {
    const boss = await request(app).post('/api/auth/register').send({ name: 'Boss', email: 'boss@example.com', password: 'StrongPass123!', role: 'user' });
    assert.equal(boss.body.user.role, 'admin');
    const sneaky = await request(app).post('/api/auth/register').send({ name: 'S', email: 's@example.com', password: 'StrongPass123!', role: 'admin' });
    assert.equal(sneaky.body.user.role, 'user');
  } finally {
    delete process.env.ADMIN_EMAIL;
  }
});

test('GET /api/auth/me returns the signed-in user without the password hash', async () => {
  const token = await register();
  const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'buyer@example.com');
  assert.equal(me.body.user.password_hash, undefined);
});

test('update and delete handle bad input and missing vehicles', async () => {
  const admin = await register('admin@example.com', 'admin');
  const auth = { Authorization: `Bearer ${admin}` };
  const id = (await addVehicle(admin)).body.vehicle.id;
  assert.equal((await request(app).put(`/api/vehicles/${id}`).set(auth).send({ quantity: -3 })).status, 400);
  assert.equal((await request(app).put(`/api/vehicles/${id}`).set(auth).send({})).status, 400);
  assert.equal((await request(app).put('/api/vehicles/424242').set(auth).send({ price: 1 })).status, 404);
  assert.equal((await request(app).put('/api/vehicles/abc').set(auth).send({ price: 1 })).status, 400);
  assert.equal((await request(app).delete('/api/vehicles/424242').set(auth)).status, 404);
  assert.equal((await request(app).post('/api/vehicles/424242/restock').set(auth).send({ quantity: 1 })).status, 404);
});

test('health check is public and malformed JSON returns 400', async () => {
  assert.equal((await request(app).get('/api/health')).status, 200);
  const bad = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');
  assert.equal(bad.status, 400);
});
