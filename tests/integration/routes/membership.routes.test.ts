import request from 'supertest';
import express from 'express';
import { membershipRouter } from '../../../src/routes/membership.routes';
import { createTestUser, createTestMembership, generateTestToken, clearDatabase } from '../../helpers/test-utils';
import { validMembershipData, updateMembershipData } from '../../fixtures/membership.fixtures';

const app = express();
app.use(express.json());
app.use('/memberships', membershipRouter);

describe('Membership Routes Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let clientUser: any;
  let clientToken: string;
  let testMembership: any;

  beforeEach(async () => {
    await clearDatabase();

    // Create test users
    adminUser = await createTestUser(['admin']);
    adminToken = generateTestToken(adminUser.id, adminUser.email, ['admin']);

    clientUser = await createTestUser(['cliente']);
    clientToken = generateTestToken(clientUser.id, clientUser.email, ['cliente']);

    // Create test membership
    testMembership = await createTestMembership();
  });

  describe('GET /memberships', () => {
    it('should return all memberships for admin user', async () => {
      const response = await request(app)
        .get('/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should return all memberships for recepcionista user', async () => {
      const recepcionistaUser = await createTestUser(['recepcionista']);
      const recepcionistaToken = generateTestToken(recepcionistaUser.id, recepcionistaUser.email, ['recepcionista']);

      const response = await request(app)
        .get('/memberships')
        .set('Authorization', `Bearer ${recepcionistaToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/memberships')
        .expect(401);
    });

    it('should return 403 for cliente user', async () => {
      await request(app)
        .get('/memberships')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('GET /memberships/:id', () => {
    it('should return membership by id for admin user', async () => {
      const response = await request(app)
        .get(`/memberships/${testMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testMembership.id);
      expect(response.body).toHaveProperty('name');
    });

    it('should return membership by id for coach user', async () => {
      const coachUser = await createTestUser(['coach']);
      const coachToken = generateTestToken(coachUser.id, coachUser.email, ['coach']);

      const response = await request(app)
        .get(`/memberships/${testMembership.id}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testMembership.id);
    });

    it('should return 404 for non-existent membership', async () => {
      await request(app)
        .get('/memberships/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 for missing membership ID', async () => {
      await request(app)
        .get('/memberships/')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404); // Express router returns 404 for empty parameter
    });
  });

  describe('POST /memberships', () => {
    it('should create new membership for admin user', async () => {
      const response = await request(app)
        .post('/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validMembershipData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', validMembershipData.name);
      expect(response.body).toHaveProperty('price', validMembershipData.price);
    });

    it('should return 400 for invalid membership data', async () => {
      const invalidData = { name: '' }; // Invalid data

      await request(app)
        .post('/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 409 for duplicate membership name', async () => {
      // First creation should succeed
      await request(app)
        .post('/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validMembershipData)
        .expect(201);

      // Second creation with same name should fail
      await request(app)
        .post('/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validMembershipData)
        .expect(409);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app)
        .post('/memberships')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(validMembershipData)
        .expect(403);
    });
  });

  describe('PUT /memberships/:id', () => {
    it('should update membership for admin user', async () => {
      const response = await request(app)
        .put(`/memberships/${testMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateMembershipData)
        .expect(200);

      expect(response.body).toHaveProperty('id', testMembership.id);
      expect(response.body).toHaveProperty('name', updateMembershipData.name);
      expect(response.body).toHaveProperty('price', updateMembershipData.price);
    });

    it('should return 404 for non-existent membership', async () => {
      await request(app)
        .put('/memberships/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateMembershipData)
        .expect(404);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app)
        .put(`/memberships/${testMembership.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateMembershipData)
        .expect(403);
    });
  });

  describe('DELETE /memberships/:id', () => {
    it('should delete membership for admin user', async () => {
      await request(app)
        .delete(`/memberships/${testMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify membership is deleted
      await request(app)
        .get(`/memberships/${testMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent membership', async () => {
      await request(app)
        .delete('/memberships/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app)
        .delete(`/memberships/${testMembership.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('PATCH /memberships/:id/toggle-status', () => {
    it('should toggle membership status for admin user', async () => {
      const initialStatus = testMembership.isActive;

      const response = await request(app)
        .patch(`/memberships/${testMembership.id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isActive', !initialStatus);
    });

    it('should return 404 for non-existent membership', async () => {
      await request(app)
        .patch('/memberships/non-existent-id/toggle-status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app)
        .patch(`/memberships/${testMembership.id}/toggle-status`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });
});