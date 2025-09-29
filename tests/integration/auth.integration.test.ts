import request from 'supertest';
import express from 'express';
import { authRoutes } from '../../src/routes/auth.routes';
import { connectDB } from '../../src/db/connectionDB';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Use in-memory MongoDB for testing
    await connectDB();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'integration@test.com',
        password: 'password123',
        full_name: 'Integration Test User',
        age: 25,
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        full_name: 'Duplicate User',
        age: 30,
        phone: '0987654321'
      };

      // First registration
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(200);

      // Second registration with same email should fail
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate user with valid credentials', async () => {
      const userData = {
        email: 'login@test.com',
        password: 'password123',
        full_name: 'Login Test User',
        age: 28,
        phone: '1111111111'
      };

      // Register user first
      await request(app)
        .post('/auth/register')
        .send(userData);

      // Then login
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });
});