import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import messagesRouter from '../routes/messages.js';
import webhookRouter, { broadcastMessage } from '../routes/webhook.js';

// Create test app with both routes
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Disable auth for testing
  process.env.AUTH_ENABLED = 'false';
  
  app.use('/api', webhookRouter);
  app.use('/api', messagesRouter);
  
  return app;
};

describe('SSE Messages Endpoint', () => {
  beforeEach(() => {
    delete process.env.AUTH_ENABLED;
    delete process.env.AUTH_TOKEN;
  });

  describe('GET /api/messages/stream', () => {
    it('should send initial connection message', (done) => {
      const app = createTestApp();
      
      request(app)
        .get('/api/messages/stream')
        .buffer(false)
        .parse((res, callback) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString();
            if (data.includes('connected')) {
              res.destroy();
              callback(null, data);
            }
          });
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).toContain('connected');
          done();
        });
    });
  });

  describe('Message Broadcasting', () => {
    it('should broadcast messages to SSE clients', (done) => {
      const app = createTestApp();
      
      // Start SSE connection
      const sseRequest = request(app)
        .get('/api/messages/stream')
        .buffer(false)
        .parse((res, callback) => {
          let data = '';
          let messageReceived = false;
          
          res.on('data', (chunk) => {
            data += chunk.toString();
            
            // Skip initial connection message
            if (data.includes('Test broadcast') && !messageReceived) {
              messageReceived = true;
              res.destroy();
              callback(null, data);
            }
          });
        });
      
      // Wait a bit for SSE connection to establish
      setTimeout(() => {
        // Send webhook message which should broadcast to SSE clients
        request(app)
          .post('/api/webhook')
          .send({ message: 'Test broadcast' })
          .end();
      }, 100);
      
      sseRequest.end((err, res) => {
        if (err) return done(err);
        expect(res.text).toContain('Test broadcast');
        done();
      });
    });
  });
});
