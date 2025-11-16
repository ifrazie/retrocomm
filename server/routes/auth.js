import express from 'express';
import { userService } from '../services/UserService.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user with password and public key
 */
router.post('/auth/register', async (req, res) => {
  const { username, password, publicKey } = req.body;

  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (!publicKey) {
    return res.status(400).json({ error: 'Public key is required' });
  }

  try {
    const result = await userService.registerUser(username, password, publicKey);
    
    res.json({
      success: true,
      userId: result.userId,
      username: result.username,
      sessionId: result.sessionId,
      isNewUser: true
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login with username and password
 */
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const result = await userService.loginUser(username, password);
    
    res.json({
      success: true,
      userId: result.userId,
      username: result.username,
      sessionId: result.sessionId,
      publicKey: result.publicKey,
      encryptedPrivateKey: result.encryptedPrivateKey,
      isNewUser: false
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/store-private-key
 * Store user's encrypted private key
 */
router.post('/auth/store-private-key', (req, res) => {
  const { sessionId, encryptedPrivateKey } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  if (!encryptedPrivateKey) {
    return res.status(400).json({ error: 'encryptedPrivateKey is required' });
  }

  const user = userService.getUserBySession(sessionId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  userService.storeEncryptedPrivateKey(user.userId, encryptedPrivateKey);
  
  res.json({ success: true });
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
      lastSeen: u.lastSeen,
      publicKey: u.publicKey // Include public key for E2EE
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
