const request = require('supertest');
const { app } = require('../server'); // Import app from server.js
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../models/User');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('User Authentication API', () => {
  let server; // Define server instance

  beforeAll((done) => {
    server = app.listen(4000, () => done()); // Start test server on port 4000
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close(); // Properly close test server
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      });
      jwt.sign.mockReturnValue('fakeToken');

      const res = await request(server) // Use `server` instead of `app`
        .post('/api/users/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'john@example.com' });

      const res = await request(server)
        .post('/api/users/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    it('should log in a user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      User.findOne.mockResolvedValue({
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fakeToken');

      const res = await request(server)
        .post('/api/users/login')
        .send({ email: 'john@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 for invalid credentials', async () => {
      User.findOne.mockResolvedValue({ email: 'john@example.com', password: 'wrongPassword' });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(server)
        .post('/api/users/login')
        .send({ email: 'john@example.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(server).get('/api/users/profile');
      expect(res.status).toBe(401);
    });
  });
});
