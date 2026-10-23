import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSearchFilters, validateRegistration, validateRestock, validateVehicle } from './validation.js';

const validVehicle = { make: ' Porsche ', model: '911', category: 'Sports', year: 2024, price: 1000, quantity: 1 };

test('validateVehicle trims text and accepts a complete vehicle', () => {
  const { value, error } = validateVehicle(validVehicle);
  assert.equal(error, undefined);
  assert.equal(value.make, 'Porsche');
  assert.equal(value.imageUrl, '');
  assert.equal(value.description, '');
});

test('validateVehicle rejects missing or malformed fields', () => {
  assert.match(validateVehicle({ ...validVehicle, make: '   ' }).error, /make/);
  assert.match(validateVehicle({ ...validVehicle, model: 'x'.repeat(81) }).error, /model/);
  assert.match(validateVehicle({ ...validVehicle, year: 1800 }).error, /year/);
  assert.match(validateVehicle({ ...validVehicle, price: '100' }).error, /Price/);
  assert.match(validateVehicle({ ...validVehicle, quantity: 1.5 }).error, /Quantity/);
  assert.match(validateVehicle({ ...validVehicle, imageUrl: 'javascript:alert(1)' }).error, /Image/);
  assert.match(validateVehicle({ ...validVehicle, description: 'x'.repeat(2001) }).error, /Description/);
});

test('validateVehicle in partial mode only checks supplied fields and rejects empty updates', () => {
  assert.deepEqual(validateVehicle({ price: 5 }, { partial: true }).value, { price: 5 });
  assert.match(validateVehicle({}, { partial: true }).error, /No details/);
  assert.match(validateVehicle({ quantity: -1 }, { partial: true }).error, /Quantity/);
});

test('validateVehicle accepts local asset paths and https URLs for images', () => {
  assert.equal(validateVehicle({ imageUrl: '/coupe.webp' }, { partial: true }).error, undefined);
  assert.equal(validateVehicle({ imageUrl: 'https://cdn.example.com/a.jpg' }, { partial: true }).error, undefined);
});

test('validateRegistration normalises email and enforces password length', () => {
  const { value } = validateRegistration({ name: ' Ada ', email: ' ADA@Example.com ', password: 'LongEnough1' });
  assert.deepEqual(value, { name: 'Ada', email: 'ada@example.com', password: 'LongEnough1' });
  assert.ok(validateRegistration({ name: 'Ada', email: 'not-an-email', password: 'LongEnough1' }).error);
  assert.ok(validateRegistration({ name: 'Ada', email: 'ada@example.com', password: 'short' }).error);
  assert.ok(validateRegistration({ email: 'ada@example.com', password: 'LongEnough1' }).error);
});

test('parseSearchFilters keeps supplied filters and rejects a bad price range', () => {
  assert.deepEqual(parseSearchFilters({ q: ' gt ', category: 'SUV', minPrice: '10', maxPrice: '' }).value, { q: 'gt', category: 'SUV', minPrice: 10 });
  assert.ok(parseSearchFilters({ minPrice: 'abc' }).error);
  assert.ok(parseSearchFilters({ maxPrice: '-5' }).error);
  assert.ok(parseSearchFilters({ minPrice: '500', maxPrice: '100' }).error);
});

test('validateRestock requires a positive whole number', () => {
  assert.equal(validateRestock(3).value, 3);
  assert.ok(validateRestock(0).error);
  assert.ok(validateRestock('3').error);
});
