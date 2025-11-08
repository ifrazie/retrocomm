import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import authMiddleware from '../middleware/auth.js';
import validateMessageMiddleware from '../middleware/validator.js';

describe('Authentication Middleware', () => {
  beforeEach(() => {
    delete process.env.AUTH_ENABLED;
    delete process.env.AUTH_TOKEN;
  });

  it('should pass through when auth is disabled', async () => {
    process.env.AUTH_ENABLED = 'false';
    
    const app = express();
    app.use(authMiddleware);
    app.get('/test', (req, res) => res.json({ success: true }));
    
    await request(app)
      .get('/test')
      .expect(200);
  });

  it('should require Authorization header when auth is enabled', async () => {
    process.env.AUTH_ENABLED = 'true';
    process.env.AUTH_TOKEN = 'secret';
    
    const app = express();
    app.use(authMiddleware);
    app.get('/test', (req, res) => res.json({ success: true }));
    
    await request(app)
      .get('/test')
      .expect(401);
  });

  it('should accept valid Bearer token', async () => {
    process.env.AUTH_ENABLED = 'true';
    process.env.AUTH_TOKEN = 'secret';
    
    const app = express();
    app.use(authMiddleware);
    app.get('/test', (req, res) => res.json({ success: true }));
    
    await request(app)
      .get('/test')
      .set('Authorization', 'Bearer secret')
      .expect(200);
  });

  it('should reject invalid token', async () => {
    process.env.AUTH_ENABLED = 'true';
    process.env.AUTH_TOKEN = 'secret';
    
    const app = express();
    app.use(authMiddleware);
    app.get('/test', (req, res) => res.json({ success: true }));
    
    await request(app)
      .get('/test')
      .set('Authorization', 'Bearer wrong')
      .expect(401);
  });
});

describe('Validation Middleware', () => {
  it('should accept valid message payload', async () => {
    const app = express();
    app.use(express.json());
    app.post('/test', validateMessageMiddleware, (req, res) => {
      res.json({ success: true, message: req.body.message });
    });
    
    const response = await request(app)
      .post('/test')
      .send({ message: 'Hello World' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });

  it('should reject payload without message field', async () => {
    const app = express();
    app.use(express.json());
    app.post('/test', validateMessageMiddleware, (req, res) => {
      res.json({ success: true });
    });
    
    const response = await request(app)
      .post('/test')
      .send({ sender: 'user' })
      .expect(400);
    
    expect(response.body.error).toBe('Invalid payload');
    expect(response.body.details).toContain('message field is required');
  });

  it('should reject non-string message', async () => {
    const app = express();
    app.use(express.json());
    app.post('/test', validateMessageMiddleware, (req, res) => {
      res.json({ success: true });
    });
    
    const response = await request(app)
      .post('/test')
      .send({ message: 123 })
      .expect(400);
    
    expect(response.body.error).toBe('Invalid payload');
    expect(response.body.details).toContain('message must be a string');
  });

  it('should sanitize HTML in message content', async () => {
    const app = express();
    app.use(express.json());
    app.post('/test', validateMessageMiddleware, (req, res) => {
      res.json({ message: req.body.message });
    });
    
    const response = await request(app)
      .post('/test')
      .send({ message: '<script>alert("xss")</script>Hello' })
      .expect(200);
    
    // Message should be sanitized
    expect(response.body.message).not.toContain('<script>');
    expect(response.body.message).toContain('Hello');
  });

  it('should accept optional sender field', async () => {
    const app = express();
    app.use(express.json());
    app.post('/test', validateMessageMiddleware, (req, res) => {
      res.json({ sender: req.body.sender });
    });
    
    const response = await request(app)
      .post('/test')
      .send({ message: 'Hello', sender: 'user123' })
      .expect(200);
    
    expect(response.body.sender).toBeDefined();
  });

  it('should accept optional timestamp field', async () => {
    const app = express();
    app.use(express.json());
    app.post('/test', validateMessageMiddleware, (req, res) => {
      res.json({ timestamp: req.body.timestamp });
    });
    
    const timestamp = Date.now();
    const response = await request(app)
      .post('/test')
      .send({ message: 'Hello', timestamp })
      .expect(200);
    
    expect(response.body.timestamp).toBe(timestamp);
  });

  it('should reject invalid timestamp type', async () => {
    const app = express();
    app.use(express.json());
    app.post('/test', validateMessageMiddleware, (req, res) => {
      res.json({ success: true });
    });
    
    const response = await request(app)
      .post('/test')
      .send({ message: 'Hello', timestamp: 'not-a-number' })
      .expect(400);
    
    expect(response.body.error).toBe('Invalid payload');
    expect(response.body.details).toContain('timestamp must be a number');
  });
});
