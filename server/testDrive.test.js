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
beforeEach(() => db.exec('DELETE FROM test_drives; DELETE FROM vehicles; DELETE FROM users;'));
after(() => db.close());

async function register(email = 'driver@example.com', role = 'user') {
  await request(app).post('/api/auth/register').send({ name: 'Alex Mercer', email, password: 'Pass1234Secure!' });
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
      quantity: 3,
      imageUrl: '/coupe.webp',
      description: 'Handcrafted grand tourer.',
    });
  return res.body.vehicle.id;
}

function getValidTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  return tomorrow.toISOString().slice(0, 10);
}

test('test drive booking requires authentication', async () => {
  const res = await request(app).post('/api/test-drives').send({
    vehicleId: 1,
    preferredDate: getValidTomorrowDate(),
    timeWindow: 'Morning',
  });
  assert.equal(res.status, 401);
});

test('books a test drive with showroom location and time window', async () => {
  const token = await register('driver1@example.com');
  const vehicleId = await createVehicle(token);
  const preferredDate = getValidTomorrowDate();

  const res = await request(app)
    .post('/api/test-drives')
    .set('Authorization', `Bearer ${token}`)
    .send({
      vehicleId,
      preferredDate,
      timeWindow: 'Afternoon',
      experienceType: 'Showroom',
      location: 'Atelier Manhattan Flagship',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.request.vehicleName, 'Aurelia GT S');
  assert.equal(res.body.request.customerName, 'Alex Mercer');
  assert.equal(res.body.request.timeWindow, 'Afternoon');
  assert.equal(res.body.request.location, 'Atelier Manhattan Flagship');
  assert.equal(res.body.request.status, 'requested');

  // Verify list
  const listRes = await request(app)
    .get('/api/test-drives')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.requests.length, 1);
  assert.equal(listRes.body.requests[0].id, res.body.request.id);
});

test('rejects past date, non-existent vehicle, or invalid time window', async () => {
  const token = await register('driver2@example.com');
  const vehicleId = await createVehicle(token);

  // Past date
  const pastRes = await request(app)
    .post('/api/test-drives')
    .set('Authorization', `Bearer ${token}`)
    .send({ vehicleId, preferredDate: '2020-01-01', timeWindow: 'Morning' });
  assert.equal(pastRes.status, 400);

  // Bad time window
  const windowRes = await request(app)
    .post('/api/test-drives')
    .set('Authorization', `Bearer ${token}`)
    .send({ vehicleId, preferredDate: getValidTomorrowDate(), timeWindow: 'Midnight' });
  assert.equal(windowRes.status, 400);

  // Non-existent vehicle
  const missingRes = await request(app)
    .post('/api/test-drives')
    .set('Authorization', `Bearer ${token}`)
    .send({ vehicleId: 99999, preferredDate: getValidTomorrowDate(), timeWindow: 'Morning' });
  assert.equal(missingRes.status, 404);
});

test('admin can confirm test drive and user can cancel their test drive', async () => {
  const userToken = await register('driver3@example.com');
  const adminToken = await register('admin@example.com', 'admin');
  const vehicleId = await createVehicle(userToken);

  const booking = await request(app)
    .post('/api/test-drives')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      vehicleId,
      preferredDate: getValidTomorrowDate(),
      timeWindow: 'Evening',
      experienceType: 'Concierge',
      location: 'Private Residence Delivery',
    });

  const bookingId = booking.body.request.id;

  // Regular user cannot confirm
  const badConfirm = await request(app)
    .patch(`/api/test-drives/${bookingId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ status: 'confirmed' });
  assert.equal(badConfirm.status, 403);

  // Admin confirms
  const adminConfirm = await request(app)
    .patch(`/api/test-drives/${bookingId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'confirmed' });
  assert.equal(adminConfirm.status, 200);
  assert.equal(adminConfirm.body.request.status, 'confirmed');

  // User cancels
  const userCancel = await request(app)
    .patch(`/api/test-drives/${bookingId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ status: 'cancelled' });
  assert.equal(userCancel.status, 200);
  assert.equal(userCancel.body.request.status, 'cancelled');
});
