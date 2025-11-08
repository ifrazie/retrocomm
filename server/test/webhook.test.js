import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import webhookRouter, { broadcastMessage } from '../routes/webhook.js';
import authMiddleware from '../middleware/auth.js';

// Create test app
const createTestApp = (authEnabled = false, authToken = 'test-token') => {
  const app = express();
  app.use(express.json());
  
  // Set environment variables for auth
  if (authEnabled) {
    process.env.AUTH_ENABLED = 'true';
    process.env.AUTH_TOKEN = authToken;
  } else {
    process.env.AUTH_ENABLED = 'false';
  }
  
  app.use('/api', webhookRouter);
  
  return app;
};

describe('Webhook Endpoint', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.AUTH_ENABLED;
    delete process.env.AUTH_TOKEN;
  });

  describe('POST /api/webhook', () => {
    it('should accept valid webhook payload', async () => {
      const app = createTestApp(false);
      
      const payload = {
        message: 'Test message',
        sender: 'test-user',
        timestamp: Date.now()
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.messageId).toBeDefined();
    });

    it('should reject payload without message field', async () => {
      const app = createTestApp(false);
      
      const payload = {
        sender: 'test-user'
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload)
        .expect(400);
      
      expect(response.body.error).toBe('Invalid payload');
      expect(response.body.details).toContain('message field is required');
    });

    it('should reject payload with non-string message', async () => {
      const app = createTestApp(false);
      
      const payload = {
        message: 123
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload)
        .expect(400);
      
      expect(response.body.error).toBe('Invalid payload');
      expect(response.body.details).toContain('message must be a string');
    });

    it('should sanitize HTML in message content', async () => {
      const app = createTestApp(false);
      
      const payload = {
        message: '<script>alert("xss")</script>Hello'
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should accept request with valid token when auth enabled', async () => {
      const app = createTestApp(true, 'secret-token');
      
      const payload = {
        message: 'Test message'
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .set('Authorization', 'Bearer secret-token')
        .send(payload)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    it('should reject request without token when auth enabled', async () => {
      const app = createTestApp(true, 'secret-token');
      
      const payload = {
        message: 'Test message'
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload)
        .expect(401);
      
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject request with invalid token when auth enabled', async () => {
      const app = createTestApp(true, 'secret-token');
      
      const payload = {
        message: 'Test message'
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .set('Authorization', 'Bearer wrong-token')
        .send(payload)
        .expect(401);
      
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should accept request without token when auth disabled', async () => {
      const app = createTestApp(false);
      
      const payload = {
        message: 'Test message'
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });
});
