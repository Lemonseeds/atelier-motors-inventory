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
beforeEach(() => db.exec('DELETE FROM orders; DELETE FROM vehicles; DELETE FROM users;'));
after(() => db.close());

async function register(email = 'buyer@example.com', role = 'user') {
  await request(app).post('/api/auth/register').send({ name: 'Morgan Vance', email, password: 'Pass1234Secure!' });
  if (role === 'admin') db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', email);
  const login = await request(app).post('/api/auth/login').send({ email, password: 'Pass1234Secure!' });
  return login.body.token;
}

async function createVehicle(token) {
  const res = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${token}`)
    .send({
      make: 'Aurelia',
      model: 'GT S',
      category: 'Coupe',
      year: 2025,
      price: 89400,
      quantity: 2,
      imageUrl: '/coupe.webp',
      description: 'Handcrafted grand tourer.',
    });
  return res.body.vehicle.id;
}

test('GET /api/orders requires authentication', async () => {
  const res = await request(app).get('/api/orders');
  assert.equal(res.status, 401);
});

test('vehicle purchase records an order with unique VIN and confirmed status', async () => {
  const token = await register('buyer1@example.com');
  const vehicleId = await createVehicle(token);

  // Purchase vehicle
  const purchaseRes = await request(app)
    .post(`/api/vehicles/${vehicleId}/purchase`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      totalPrice: 93900,
      deliveryAddress: '100 Central Park South, New York, NY',
      configuration: { paint: 1, trim: 1 },
    });

  assert.equal(purchaseRes.status, 200);
  assert.equal(purchaseRes.body.vehicle.quantity, 1);
  assert.ok(purchaseRes.body.order);
  assert.equal(purchaseRes.body.order.status, 'confirmed');
  assert.ok(purchaseRes.body.order.vin.startsWith('1ATAU25M'));

  // Query user orders
  const ordersRes = await request(app)
    .get('/api/orders')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(ordersRes.status, 200);
  assert.equal(ordersRes.body.orders.length, 1);
  const order = ordersRes.body.orders[0];
  assert.equal(order.vehicle.make, 'Aurelia');
  assert.equal(order.vehicle.model, 'GT S');
  assert.equal(order.totalPrice, 93900);
  assert.equal(order.status, 'confirmed');
  assert.equal(order.deliveryAddress, '100 Central Park South, New York, NY');
  assert.ok(order.vin);
});

test('admin can update order progression stage', async () => {
  const userToken = await register('buyer2@example.com');
  const adminToken = await register('admin@example.com', 'admin');
  const vehicleId = await createVehicle(userToken);

  const purchaseRes = await request(app)
    .post(`/api/vehicles/${vehicleId}/purchase`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ totalPrice: 89400 });

  const orderId = purchaseRes.body.order.id;

  // Non-admin cannot update stage
  const badPatch = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ status: 'inspection' });
  assert.equal(badPatch.status, 403);

  // Admin updates to inspection
  const adminPatch = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'inspection' });
  assert.equal(adminPatch.status, 200);
  assert.equal(adminPatch.body.order.status, 'inspection');
});
