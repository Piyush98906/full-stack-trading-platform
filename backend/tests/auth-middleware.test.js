const test = require('node:test');
const assert = require('node:assert/strict');
const { adminOnly } = require('../middleware/auth');

const createResponse = () => {
  const response = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };

  return response;
};

test('adminOnly blocks requests without a logged-in user', () => {
  const req = {};
  const res = createResponse();
  let nextCalled = false;

  adminOnly(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.payload, { message: 'Admin access required' });
});

test('adminOnly blocks non-admin users', () => {
  const req = { user: { role: 'user' } };
  const res = createResponse();
  let nextCalled = false;

  adminOnly(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.payload, { message: 'Admin access required' });
});

test('adminOnly allows admin users', () => {
  const req = { user: { role: 'admin' } };
  const res = createResponse();
  let nextCalled = false;

  adminOnly(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload, null);
});
