import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Simple in-memory user management service with password support
 * For production, replace with database (DynamoDB, PostgreSQL, etc.)
 */
class UserService {
  constructor() {
    // Map of userId -> user data
    this.users = new Map();
    // Map of username -> userId (for quick lookup)
    this.usernameIndex = new Map();
    // Map of sessionId -> userId (for WebSocket connections)
    this.sessions = new Map();
  }

  /**
   * Register a new user with password
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @param {string} publicKey - User's public key for E2EE
   * @returns {Promise<Object>} User object with userId and sessionId
   */
  async registerUser(username, password, publicKey) {
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!publicKey) {
      throw new Error('Public key is required');
    }

    const cleanUsername = username.trim();

    // Check if user already exists
    if (this.usernameIndex.has(cleanUsername)) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const userId = uuidv4();
    const sessionId = uuidv4();
    
    const user = {
      userId,
      username: cleanUsername,
      passwordHash,
      publicKey,
      encryptedPrivateKey: null, // Will be set by client
      createdAt: new Date().toISOString(),
      online: false
    };

    this.users.set(userId, user);
    this.usernameIndex.set(cleanUsername, userId);
    this.sessions.set(sessionId, userId);

    return {
      userId,
      username: cleanUsername,
      sessionId,
      isNewUser: true
    };
  }

  /**
   * Login user with password
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} User object with userId and sessionId
   */
  async loginUser(username, password) {
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    const cleanUsername = username.trim();

    // Check if user exists
    if (!this.usernameIndex.has(cleanUsername)) {
      throw new Error('Invalid username or password');
    }

    const userId = this.usernameIndex.get(cleanUsername);
    const user = this.users.get(userId);

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    // Create new session
    const sessionId = uuidv4();
    this.sessions.set(sessionId, userId);

    return {
      userId: user.userId,
      username: user.username,
      sessionId,
      publicKey: user.publicKey,
      encryptedPrivateKey: user.encryptedPrivateKey,
      isNewUser: false
    };
  }

  /**
   * Store user's encrypted private key
   * @param {string} userId - User ID
   * @param {string} encryptedPrivateKey - Encrypted private key
   */
  storeEncryptedPrivateKey(userId, encryptedPrivateKey) {
    const user = this.users.get(userId);
    if (user) {
      user.encryptedPrivateKey = encryptedPrivateKey;
    }
  }

  /**
   * Get user by session ID
   */
  getUserBySession(sessionId) {
    const userId = this.sessions.get(sessionId);
    if (!userId) return null;
    return this.users.get(userId);
  }

  /**
   * Get user by user ID
   */
  getUserById(userId) {
    return this.users.get(userId);
  }

  /**
   * Get user by username
   */
  getUserByUsername(username) {
    const userId = this.usernameIndex.get(username);
    if (!userId) return null;
    return this.users.get(userId);
  }

  /**
   * Set user online status
   */
  setUserOnline(userId, online = true) {
    const user = this.users.get(userId);
    if (user) {
      user.online = online;
      user.lastSeen = new Date().toISOString();
    }
  }

  /**
   * Get all online users
   */
  getOnlineUsers() {
    return Array.from(this.users.values()).filter(user => user.online);
  }

  /**
   * Get all users (for user list)
   */
  getAllUsers() {
    return Array.from(this.users.values()).map(user => ({
      userId: user.userId,
      username: user.username,
      online: user.online,
      lastSeen: user.lastSeen,
      publicKey: user.publicKey // Include public key for E2EE
    }));
  }

  /**
   * Invalidate session
   */
  logout(sessionId) {
    const userId = this.sessions.get(sessionId);
    if (userId) {
      this.setUserOnline(userId, false);
      this.sessions.delete(sessionId);
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default UserService;
