import { v4 as uuidv4 } from 'uuid';

/**
 * Simple in-memory user management service
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
   * Register or login a user (simple username-based)
   * @param {string} username - Username
   * @returns {Object} User object with userId and sessionId
   */
  authenticateUser(username) {
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }

    const cleanUsername = username.trim();

    // Check if user already exists
    if (this.usernameIndex.has(cleanUsername)) {
      const userId = this.usernameIndex.get(cleanUsername);
      const user = this.users.get(userId);
      
      // Create new session
      const sessionId = uuidv4();
      this.sessions.set(sessionId, userId);
      
      return {
        userId: user.userId,
        username: user.username,
        sessionId,
        isNewUser: false
      };
    }

    // Create new user
    const userId = uuidv4();
    const sessionId = uuidv4();
    
    const user = {
      userId,
      username: cleanUsername,
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
      lastSeen: user.lastSeen
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
