const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllowedOrigins, normalizeBaseUrl, validateEnv } = require('../config/env');

const originalEnv = { ...process.env };

const resetEnv = () => {
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }

  Object.assign(process.env, originalEnv);
};

test.afterEach(() => {
  resetEnv();
});

test('normalizeBaseUrl trims trailing slashes and preserves root slash', () => {
  assert.equal(normalizeBaseUrl('https://example.com///'), 'https://example.com');
  assert.equal(normalizeBaseUrl(' / '), '/');
  assert.equal(normalizeBaseUrl(''), '');
});

test('getAllowedOrigins merges configured origins and removes duplicates', () => {
  process.env.CLIENT_URL = 'https://frontend.example.com/';
  process.env.DASHBOARD_URL = 'https://dashboard.example.com';
  process.env.ALLOWED_ORIGINS =
    ' https://frontend.example.com , https://preview.example.com/ , , https://dashboard.example.com ';

  assert.deepEqual(getAllowedOrigins(), [
    'https://frontend.example.com',
    'https://dashboard.example.com',
    'https://preview.example.com'
  ]);
});

test('validateEnv throws when required environment variables are missing', () => {
  delete process.env.MONGO_URI;
  delete process.env.JWT_SECRET;

  assert.throws(() => validateEnv(), /Missing required environment variables: MONGO_URI, JWT_SECRET/);
});

test('validateEnv throws when JWT secret is too short', () => {
  process.env.MONGO_URI = 'mongodb://localhost:27017/trading-platform';
  process.env.JWT_SECRET = 'too-short';

  assert.throws(() => validateEnv(), /JWT_SECRET must be at least 32 characters long/);
});

test('validateEnv requires at least one allowed origin in production', () => {
  process.env.MONGO_URI = 'mongodb://localhost:27017/trading-platform';
  process.env.JWT_SECRET = '12345678901234567890123456789012';
  process.env.NODE_ENV = 'production';
  delete process.env.CLIENT_URL;
  delete process.env.DASHBOARD_URL;
  delete process.env.ALLOWED_ORIGINS;

  assert.throws(
    () => validateEnv(),
    /Production deployments must define at least one allowed origin/
  );
});

test('validateEnv passes with valid production configuration', () => {
  process.env.MONGO_URI = 'mongodb://localhost:27017/trading-platform';
  process.env.JWT_SECRET = '12345678901234567890123456789012';
  process.env.NODE_ENV = 'production';
  process.env.CLIENT_URL = 'https://frontend.example.com';

  assert.doesNotThrow(() => validateEnv());
});
