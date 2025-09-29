import request from 'supertest';
import express from 'express';
import { subscriptionRouter } from '../../../src/routes/subscription.routes';
import { createTestUser, createTestMembership, createTestSubscription, generateTestToken, clearDatabase } from '../../helpers/test-utils';
import { validSubscriptionData, addMembershipToSubscriptionData } from '../../fixtures/subscription.fixtures';

const app = express();
app.use(express.json());
app.use('/subscriptions', subscriptionRouter);

describe('Subscription Routes Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let clientUser: any;
  let clientToken: string;
  let recepcionistaUser: any;
  let recepcionistaToken: string;
  let testMembership: any;
  let testSubscription: any;

  beforeEach(async () => {
    await clearDatabase();

    // Create test users
    adminUser = await createTestUser(['admin']);
    adminToken = generateTestToken(adminUser.id, adminUser.email, ['admin']);

    clientUser = await createTestUser(['cliente']);
    clientToken = generateTestToken(clientUser.id, clientUser.email, ['cliente']);

    recepcionistaUser = await createTestUser(['recepcionista']);
    recepcionistaToken = generateTestToken(recepcionistaUser.id, recepcionistaUser.email, ['recepcionista']);

    // Create test membership and subscription
    testMembership = await createTestMembership();
    testSubscription = await createTestSubscription(clientUser.id, [testMembership.id]);
  });

  describe('GET /subscriptions/users/:userId', () => {
    it('should return subscription by userId for admin user', async () => {
      const response = await request(app)
        .get(`/subscriptions/users/${clientUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', clientUser.id);
      expect(response.body).toHaveProperty('memberships');
    });

    it('should return subscription by userId for recepcionista user', async () => {
      const response = await request(app)
        .get(`/subscriptions/users/${clientUser.id}`)
        .set('Authorization', `Bearer ${recepcionistaToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', clientUser.id);
    });

    it('should allow user to access their own subscription', async () => {
      const response = await request(app)
        .get(`/subscriptions/users/${clientUser.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', clientUser.id);
    });

    it('should return 403 when user tries to access another user subscription', async () => {
      const otherUser = await createTestUser(['cliente']);
      const otherUserToken = generateTestToken(otherUser.id, otherUser.email, ['cliente']);

      await request(app)
        .get(`/subscriptions/users/${clientUser.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user subscription', async () => {
      await request(app)
        .get('/subscriptions/users/non-existent-user-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 for missing userId parameter', async () => {
      await request(app)
        .get('/subscriptions/users/')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404); // Express router returns 404 for empty parameter
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/subscriptions/users/${clientUser.id}`)
        .expect(401);
    });
  });

  describe('POST /subscriptions', () => {
    it('should create new subscription for admin user', async () => {
      const newUser = await createTestUser(['cliente']);
      const subscriptionData = { userId: newUser.id };

      const response = await request(app)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(subscriptionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', newUser.id);
      expect(response.body).toHaveProperty('memberships');
      expect(response.body.memberships).toBeInstanceOf(Array);
    });

    it('should return 400 for missing userId', async () => {
      await request(app)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('should return 404 for non-existent user', async () => {
      const subscriptionData = { userId: 'non-existent-user-id' };

      await request(app)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(subscriptionData)
        .expect(404);
    });

    it('should return 409 for existing subscription', async () => {
      const subscriptionData = { userId: clientUser.id };

      await request(app)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(subscriptionData)
        .expect(409);
    });

    it('should return 403 for non-admin user', async () => {
      const newUser = await createTestUser(['cliente']);
      const subscriptionData = { userId: newUser.id };

      await request(app)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(subscriptionData)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      const subscriptionData = { userId: 'some-user-id' };

      await request(app)
        .post('/subscriptions')
        .send(subscriptionData)
        .expect(401);
    });
  });

  describe('PUT /subscriptions/:id/add-membership', () => {
    it('should add membership to subscription for admin user', async () => {
      const newMembership = await createTestMembership('VIP Membership', 120000);
      const membershipData = { membershipId: newMembership.id };

      const response = await request(app)
        .put(`/subscriptions/${testSubscription.id}/add-membership`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(membershipData)
        .expect(200);

      expect(response.body).toHaveProperty('id', testSubscription.id);
      expect(response.body).toHaveProperty('memberships');
      expect(response.body.memberships).toContain(newMembership.id);
    });

    it('should add membership to subscription for recepcionista user', async () => {
      const newMembership = await createTestMembership('Standard Membership', 70000);
      const membershipData = { membershipId: newMembership.id };

      const response = await request(app)
        .put(`/subscriptions/${testSubscription.id}/add-membership`)
        .set('Authorization', `Bearer ${recepcionistaToken}`)
        .send(membershipData)
        .expect(200);

      expect(response.body.memberships).toContain(newMembership.id);
    });

    it('should return 400 for missing subscriptionId', async () => {
      const membershipData = { membershipId: testMembership.id };

      await request(app)
        .put('/subscriptions//add-membership')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(membershipData)
        .expect(404);
    });

    it('should return 400 for missing membershipId', async () => {
      await request(app)
        .put(`/subscriptions/${testSubscription.id}/add-membership`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('should return 404 for non-existent subscription', async () => {
      const membershipData = { membershipId: testMembership.id };

      await request(app)
        .put('/subscriptions/non-existent-subscription-id/add-membership')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(membershipData)
        .expect(404);
    });

    it('should return 404 for non-existent membership', async () => {
      const membershipData = { membershipId: 'non-existent-membership-id' };

      await request(app)
        .put(`/subscriptions/${testSubscription.id}/add-membership`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(membershipData)
        .expect(404);
    });

    it('should return 403 for cliente user', async () => {
      const membershipData = { membershipId: testMembership.id };

      await request(app)
        .put(`/subscriptions/${testSubscription.id}/add-membership`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(membershipData)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      const membershipData = { membershipId: testMembership.id };

      await request(app)
        .put(`/subscriptions/${testSubscription.id}/add-membership`)
        .send(membershipData)
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    it('should validate subscription creation data format', async () => {
      const invalidData = { userId: '', extraField: 'invalid' };

      await request(app)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should validate add membership data format', async () => {
      const invalidData = { membershipId: '', extraField: 'invalid' };

      const response = await request(app)
        .put(`/subscriptions/${testSubscription.id}/add-membership`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });
});