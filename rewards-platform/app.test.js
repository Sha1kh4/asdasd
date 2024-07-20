const request = require('supertest');
const Diamante = require('diamante-sdk-js');

// Mock the Diamante SDK
jest.mock('diamante-sdk-js', () => ({
  createWallet: jest.fn().mockResolvedValue({ address: 'mock_address' }),
  getBalance: jest.fn().mockResolvedValue(100),
  transfer: jest.fn().mockResolvedValue({ hash: 'mock_tx_hash' }),
  burn: jest.fn().mockResolvedValue({ hash: 'mock_tx_hash' }),
}));

// Mock SQLite
jest.mock('sqlite3', () => ({
  verbose: jest.fn(() => ({
    Database: jest.fn(() => ({
      run: jest.fn((query, params, callback) => callback && callback()),
      get: jest.fn((query, params, callback) => callback(null, { wallet_address: 'mock_address', loyalty_points: 0 })),
      all: jest.fn((query, params, callback) => callback(null, [])),
      exec: jest.fn((query, callback) => callback && callback(null)),
      close: jest.fn(),
    })),
  })),
}));

const app = require('./server'); // Assuming your main app file is named app.js

describe('Rewards and Loyalty Platform API', () => {
  // Your test cases here (same as before)
  
  test('POST /users - Create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'testuser' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe('testuser');
    expect(res.body.wallet_address).toBe('mock_address');
  });

  test('GET /users/:id/balance - Get user balance', async () => {
    const res = await request(app).get('/users/1/balance');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tokens', 100);
    expect(res.body).toHaveProperty('loyalty_points', 0);
  });

  test('POST /users/:id/issue-tokens - Issue tokens to a user', async () => {
    const res = await request(app)
      .post('/users/1/issue-tokens')
      .send({ amount: 50 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Tokens issued successfully');
    expect(res.body).toHaveProperty('tx_hash', 'mock_tx_hash');
  });

  test('POST /users/:id/redeem-tokens - Redeem tokens', async () => {
    const res = await request(app)
      .post('/users/1/redeem-tokens')
      .send({ amount: 30 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Tokens redeemed successfully');
    expect(res.body).toHaveProperty('tx_hash', 'mock_tx_hash');
  });

  test('POST /users/:id/add-loyalty-points - Add loyalty points', async () => {
    const res = await request(app)
      .post('/users/1/add-loyalty-points')
      .send({ points: 100 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Loyalty points added successfully');
  });

  test('GET /users/:id/transactions - Get transaction history', async () => {
    const res = await request(app).get('/users/1/transactions');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(0); // Mocked to return an empty array
  });
});