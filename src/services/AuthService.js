/**
 * Authentication service for multiuser support
 */
class AuthService {
  constructor() {
    this.baseUrl = '/api';
    this.sessionId = this.loadSession();
    this.username = this.loadUsername();
  }

  /**
   * Load session from localStorage
   */
  loadSession() {
    return localStorage.getItem('retro_session_id');
  }

  /**
   * Load username from localStorage
   */
  loadUsername() {
    return localStorage.getItem('retro_username');
  }

  /**
   * Save session to localStorage
   */
  saveSession(sessionId, username) {
    localStorage.setItem('retro_session_id', sessionId);
    localStorage.setItem('retro_username', username);
    this.sessionId = sessionId;
    this.username = username;
  }

  /**
   * Clear session from localStorage
   */
  clearSession() {
    localStorage.removeItem('retro_session_id');
    localStorage.removeItem('retro_username');
    this.sessionId = null;
    this.username = null;
  }

  /**
   * Login with username
   * @param {string} username - Username
   * @returns {Promise<Object>} User data with sessionId
   */
  async login(username) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      this.saveSession(data.sessionId, data.username);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    if (!this.sessionId) return;

    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: this.sessionId }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get list of all users
   * @returns {Promise<Array>} List of users
   */
  async getUsers() {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/auth/users?sessionId=${this.sessionId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  /**
   * Verify current session
   * @returns {Promise<Object>} User data
   */
  async verifySession() {
    if (!this.sessionId) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/auth/session?sessionId=${this.sessionId}`
      );

      if (!response.ok) {
        this.clearSession();
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session verification error:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.sessionId;
  }

  /**
   * Get current session ID
   * @returns {string|null}
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Get current username
   * @returns {string|null}
   */
  getUsername() {
    return this.username;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default AuthService;
