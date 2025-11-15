import express from 'express';
import { userService } from '../services/UserService.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Simple username-based authentication (no password for demo)
 */
router.post('/auth/login', (req, res) => {
  const { username } = req.body;

  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const result = userService.authenticateUser(username);
    
    res.json({
      success: true,
      userId: result.userId,
      username: result.username,
      sessionId: result.sessionId,
      isNewUser: result.isNewUser
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/auth/logout', (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  userService.logout(sessionId);
  
  res.json({ success: true });
});

/**
 * GET /api/auth/users
 * Get list of all users (for user selection)
 */
router.get('/auth/users', (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  // Verify session
  const user = userService.getUserBySession(sessionId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const users = userService.getAllUsers()
    .filter(u => u.userId !== user.userId) // Exclude self
    .map(u => ({
      username: u.username,
      online: u.online,
      lastSeen: u.lastSeen
    }));

  res.json({ users });
});

/**
 * GET /api/auth/session
 * Verify session and get user info
 */
router.get('/auth/session', (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const user = userService.getUserBySession(sessionId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  res.json({
    userId: user.userId,
    username: user.username,
    online: user.online
  });
});

export default router;
