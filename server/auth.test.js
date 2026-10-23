import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { hashPassword, readToken, signToken, verifyPassword } from './auth.js';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

test('hashPassword salts every hash and verifyPassword checks it', () => {
  const first = hashPassword('CorrectHorse1');
  assert.notEqual(first, hashPassword('CorrectHorse1'));
  assert.equal(verifyPassword('CorrectHorse1', first), true);
  assert.equal(verifyPassword('WrongHorse1', first), false);
  assert.equal(verifyPassword('CorrectHorse1', 'malformed'), false);
});

test('signToken produces a token that readToken accepts', () => {
  const claims = readToken(signToken({ id: 7 }));
  assert.equal(claims.sub, 7);
  assert.ok(claims.exp > Date.now() / 1000);
});

test('readToken rejects garbage, expired, and unsigned tokens', () => {
  assert.equal(readToken(''), null);
  assert.equal(readToken('a.b'), null);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const expired = encode({ sub: 1, exp: Math.floor(Date.now() / 1000) - 10 });
  const secret = process.env.JWT_SECRET || 'development-only-change-this-secret';
  const signature = createHmac('sha256', secret).update(`${header}.${expired}`).digest('base64url');
  assert.equal(readToken(`${header}.${expired}.${signature}`), null);
  const none = encode({ alg: 'none', typ: 'JWT' });
  assert.equal(readToken(`${none}.${encode({ sub: 1, exp: 9999999999 })}.`), null);
});
