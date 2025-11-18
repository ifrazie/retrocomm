import { cryptoService } from './CryptoService.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication service for multiuser support with E2EE
 */
class AuthService {
  constructor() {
    this.baseUrl = '/api';
    this.sessionId = this.loadSession();
    this.username = this.loadUsername();
    this.encryptedPrivateKey = this.loadEncryptedPrivateKey();
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
   * Load encrypted private key from localStorage
   */
  loadEncryptedPrivateKey() {
    return localStorage.getItem('retro_encrypted_private_key');
  }

  /**
   * Save session to localStorage
   */
  saveSession(sessionId, username, encryptedPrivateKey = null) {
    localStorage.setItem('retro_session_id', sessionId);
    localStorage.setItem('retro_username', username);
    if (encryptedPrivateKey) {
      localStorage.setItem('retro_encrypted_private_key', encryptedPrivateKey);
    }
    this.sessionId = sessionId;
    this.username = username;
    this.encryptedPrivateKey = encryptedPrivateKey;
  }

  /**
   * Clear session from localStorage
   */
  clearSession() {
    localStorage.removeItem('retro_session_id');
    localStorage.removeItem('retro_username');
    localStorage.removeItem('retro_encrypted_private_key');
    this.sessionId = null;
    this.username = null;
    this.encryptedPrivateKey = null;
    cryptoService.clearKeys();
  }

  /**
   * Register new user with password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} User data with sessionId
   */
  async register(username, password) {
    try {
      // Generate key pair
      await cryptoService.generateKeyPair();
      const publicKey = await cryptoService.exportPublicKey();

      // Register user
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, publicKey }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();

      // Encrypt and store private key
      const encryptedPrivateKey = await cryptoService.exportEncryptedPrivateKey(password);
      this.saveSession(data.sessionId, data.username, encryptedPrivateKey);

      // Store encrypted private key on server
      await this.storeEncryptedPrivateKey(data.sessionId, encryptedPrivateKey);

      return data;
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with username and password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} User data with sessionId
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();

      // Decrypt private key
      if (data.encryptedPrivateKey) {
        try {
          const privateKey = await cryptoService.importEncryptedPrivateKey(
            data.encryptedPrivateKey,
            password
          );
          const publicKey = await cryptoService.importPublicKey(data.publicKey);
          cryptoService.setKeyPair({ publicKey, privateKey });
        } catch (error) {
          logger.error('Failed to decrypt private key:', error);
          throw new Error('Invalid password');
        }
      }

      this.saveSession(data.sessionId, data.username, data.encryptedPrivateKey);

      return data;
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Store encrypted private key on server
   * @param {string} sessionId - Session ID
   * @param {string} encryptedPrivateKey - Encrypted private key
   */
  async storeEncryptedPrivateKey(sessionId, encryptedPrivateKey) {
    try {
      await fetch(`${this.baseUrl}/auth/store-private-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, encryptedPrivateKey }),
      });
    } catch (error) {
      logger.error('Failed to store private key:', error);
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
      logger.error('Logout error:', error);
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
      
      // Store public keys for E2EE
      for (const user of data.users) {
        if (user.publicKey) {
          await cryptoService.storePublicKey(user.username, user.publicKey);
        }
      }
      
      return data.users;
    } catch (error) {
      logger.error('Get users error:', error);
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
      
      // Note: Private key is NOT restored here for security reasons
      // User must re-login with password to decrypt messages
      // This prevents unauthorized access if someone gets the session token
      
      return data;
    } catch (error) {
      logger.error('Session verification error:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Restore private key from stored encrypted key using password
   * @param {string} password - User's password
   * @returns {Promise<boolean>} Success status
   */
  async restorePrivateKey(password) {
    if (!this.encryptedPrivateKey) {
      throw new Error('No encrypted private key stored');
    }

    try {
      // Get user's public key from server
      const response = await fetch(
        `${this.baseUrl}/auth/session?sessionId=${this.sessionId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }
      
      const data = await response.json();
      
      // Decrypt and import private key
      const privateKey = await cryptoService.importEncryptedPrivateKey(
        this.encryptedPrivateKey,
        password
      );
      
      // Import public key
      const publicKey = await cryptoService.importPublicKey(data.publicKey);
      
      // Set key pair in crypto service
      cryptoService.setKeyPair({ publicKey, privateKey });
      
      return true;
    } catch (error) {
      logger.error('Failed to restore private key:', error);
      throw new Error('Invalid password or corrupted key');
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
