import { v4 as uuidv4 } from 'uuid';

/**
 * Simple in-memory message storage service
 * For production, replace with database (DynamoDB, PostgreSQL, etc.)
 */
class MessageService {
  constructor() {
    // Map of messageId -> message data
    this.messages = new Map();
    // Map of userId -> array of message IDs (inbox)
    this.userInboxes = new Map();
    // Map of userId -> array of message IDs (sent)
    this.userSentMessages = new Map();
  }

  /**
   * Send a message from one user to another
   * @param {string} fromUserId - Sender user ID
   * @param {string} toUsername - Recipient username
   * @param {string} content - Message content (may be encrypted)
   * @param {boolean} encrypted - Whether the content is encrypted
   * @returns {Object} Created message
   */
  sendMessage(fromUserId, toUsername, content, encrypted = false) {
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    const message = {
      messageId,
      fromUserId,
      toUsername,
      content,
      encrypted,
      timestamp,
      status: 'sent',
      deliveredAt: null,
      readAt: null
    };

    this.messages.set(messageId, message);

    // Add to sender's sent messages
    if (!this.userSentMessages.has(fromUserId)) {
      this.userSentMessages.set(fromUserId, []);
    }
    this.userSentMessages.get(fromUserId).push(messageId);

    return message;
  }

  /**
   * Deliver a message to recipient's inbox
   * @param {string} messageId - Message ID
   * @param {string} toUserId - Recipient user ID
   */
  deliverMessage(messageId, toUserId) {
    const message = this.messages.get(messageId);
    if (!message) return null;

    message.status = 'delivered';
    message.deliveredAt = new Date().toISOString();

    // Add to recipient's inbox
    if (!this.userInboxes.has(toUserId)) {
      this.userInboxes.set(toUserId, []);
    }
    this.userInboxes.get(toUserId).push(messageId);

    return message;
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   */
  markAsRead(messageId) {
    const message = this.messages.get(messageId);
    if (!message) return null;

    message.status = 'read';
    message.readAt = new Date().toISOString();

    return message;
  }

  /**
   * Get user's inbox messages
   * @param {string} userId - User ID
   * @param {number} limit - Max number of messages to return
   * @returns {Array} Array of messages
   */
  getUserInbox(userId, limit = 50) {
    const messageIds = this.userInboxes.get(userId) || [];
    return messageIds
      .slice(-limit)
      .map(id => this.messages.get(id))
      .filter(msg => msg !== undefined)
      .reverse(); // Most recent first
  }

  /**
   * Get user's sent messages
   * @param {string} userId - User ID
   * @param {number} limit - Max number of messages to return
   * @returns {Array} Array of messages
   */
  getUserSentMessages(userId, limit = 50) {
    const messageIds = this.userSentMessages.get(userId) || [];
    return messageIds
      .slice(-limit)
      .map(id => this.messages.get(id))
      .filter(msg => msg !== undefined)
      .reverse(); // Most recent first
  }

  /**
   * Get conversation between two users
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @param {number} limit - Max number of messages
   * @returns {Array} Array of messages
   */
  getConversation(userId1, userId2, limit = 100) {
    const allMessages = Array.from(this.messages.values())
      .filter(msg => 
        (msg.fromUserId === userId1 && msg.toUserId === userId2) ||
        (msg.fromUserId === userId2 && msg.toUserId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);

    return allMessages;
  }

  /**
   * Get message by ID
   */
  getMessage(messageId) {
    return this.messages.get(messageId);
  }

  /**
   * Get unread message count for user
   */
  getUnreadCount(userId) {
    const messageIds = this.userInboxes.get(userId) || [];
    return messageIds
      .map(id => this.messages.get(id))
      .filter(msg => msg && msg.status !== 'read')
      .length;
  }

  /**
   * Clear all messages (for testing)
   */
  clearAll() {
    this.messages.clear();
    this.userInboxes.clear();
    this.userSentMessages.clear();
  }
}

// Export singleton instance
export const messageService = new MessageService();
export default MessageService;
