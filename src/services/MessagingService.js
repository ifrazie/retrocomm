import { authService } from './AuthService.js';
import { cryptoService } from './CryptoService.js';

/**
 * Real-time messaging service using SSE with E2EE
 */
class MessagingService {
  constructor() {
    this.baseUrl = '/api';
    this.eventSource = null;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.isConnected = false;
  }

  /**
   * Connect to SSE stream for real-time messages
   */
  connect() {
    const sessionId = authService.getSessionId();
    if (!sessionId) {
      throw new Error('Not authenticated');
    }

    // Close existing connection
    this.disconnect();

    // Create new SSE connection
    this.eventSource = new EventSource(
      `${this.baseUrl}/messages/stream?sessionId=${sessionId}`
    );

    this.eventSource.onopen = () => {
      console.log('✓ Connected to message stream');
      this.isConnected = true;
      this.notifyConnectionHandlers(true);
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.isConnected = false;
      this.notifyConnectionHandlers(false);
      
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (authService.isAuthenticated()) {
          console.log('Attempting to reconnect...');
          this.connect();
        }
      }, 5000);
    };
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      this.notifyConnectionHandlers(false);
    }
  }

  /**
   * Handle incoming message
   */
  async handleMessage(data) {
    if (data.type === 'connected') {
      console.log('Connected as:', data.username);
      return;
    }

    if (data.type === 'new_message') {
      // Decrypt message if encrypted
      let message = data.message;
      if (message.encrypted && message.content) {
        try {
          const decryptedContent = await cryptoService.decryptMessage(message.content);
          message = { ...message, content: decryptedContent, encrypted: false };
        } catch (error) {
          console.error('Failed to decrypt message:', error);
          
          // Provide helpful error message based on the error type
          let errorMessage = '[🔒 ENCRYPTED MESSAGE]';
          if (error.message.includes('No private key')) {
            errorMessage = '[🔒 ENCRYPTED - Please re-login with password to decrypt]';
          } else {
            errorMessage = '[🔒 ENCRYPTED - Decryption failed]';
          }
          
          message = { 
            ...message, 
            content: errorMessage,
            encrypted: true,
            decryptionFailed: true
          };
        }
      }
      this.notifyMessageHandlers(message);
    }
  }

  /**
   * Register message handler
   * @param {Function} handler - Callback function for new messages
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Register connection status handler
   * @param {Function} handler - Callback function for connection status changes
   */
  onConnectionChange(handler) {
    this.connectionHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Notify all message handlers
   */
  notifyMessageHandlers(message) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  /**
   * Notify all connection handlers
   */
  notifyConnectionHandlers(connected) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  /**
   * Send a message to another user
   * @param {string} toUsername - Recipient username
   * @param {string} content - Message content
   * @param {boolean} encrypt - Whether to encrypt the message (default: true for non-ChatBot)
   * @returns {Promise<Object>} Message result
   */
  async sendMessage(toUsername, content, encrypt = true) {
    const sessionId = authService.getSessionId();
    if (!sessionId) {
      throw new Error('Not authenticated');
    }

    try {
      let messageContent = content;
      let isEncrypted = false;

      // Encrypt message for real users (not ChatBot)
      if (encrypt && toUsername !== 'ChatBot') {
        try {
          messageContent = await cryptoService.encryptMessage(content, toUsername);
          isEncrypted = true;
        } catch (error) {
          console.error('Encryption failed, sending unencrypted:', error);
          // Fall back to unencrypted if encryption fails
        }
      }

      const response = await fetch(`${this.baseUrl}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          toUsername,
          content: messageContent,
          encrypted: isEncrypted,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Get inbox messages
   * @param {number} limit - Max number of messages
   * @returns {Promise<Object>} Inbox data
   */
  async getInbox(limit = 50) {
    const sessionId = authService.getSessionId();
    if (!sessionId) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/messages/inbox?sessionId=${sessionId}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch inbox');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get inbox error:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Result
   */
  async markAsRead(messageId) {
    const sessionId = authService.getSessionId();
    if (!sessionId) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messageId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export const messagingService = new MessagingService();
export default MessagingService;
