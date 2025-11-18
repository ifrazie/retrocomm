/**
 * WebSocket connection management service
 * Handles real-time message delivery via Server-Sent Events (SSE)
 */
class WebSocketService {
  constructor() {
    // Map of userId -> array of SSE response objects
    this.connections = new Map();
  }

  /**
   * Add a new SSE connection for a user
   * @param {string} userId - User ID
   * @param {Response} res - Express response object
   */
  addConnection(userId, res) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, []);
    }
    this.connections.get(userId).push(res);

    console.log(`✓ User ${userId} connected via SSE. Total connections: ${this.connections.get(userId).length}`);
  }

  /**
   * Remove an SSE connection
   * @param {string} userId - User ID
   * @param {Response} res - Express response object
   */
  removeConnection(userId, res) {
    if (!this.connections.has(userId)) return;

    const userConnections = this.connections.get(userId);
    const index = userConnections.indexOf(res);
    
    if (index !== -1) {
      userConnections.splice(index, 1);
      console.log(`✗ User ${userId} disconnected. Remaining connections: ${userConnections.length}`);
    }

    // Clean up empty connection arrays
    if (userConnections.length === 0) {
      this.connections.delete(userId);
    }
  }

  /**
   * Send a message to a specific user
   * @param {string} userId - Recipient user ID
   * @param {Object} data - Data to send
   */
  sendToUser(userId, data) {
    const userConnections = this.connections.get(userId);
    
    if (!userConnections || userConnections.length === 0) {
      console.log(`⚠ User ${userId} has no active connections`);
      return false;
    }

    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    // Send to all connections for this user (multiple tabs/devices)
    userConnections.forEach(res => {
      try {
        res.write(message);
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error.message);
      }
    });

    console.log(`📤 Sent message to user ${userId} (${userConnections.length} connection(s))`);
    return true;
  }

  /**
   * Broadcast to all connected users
   * @param {Object} data - Data to broadcast
   */
  broadcast(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    let sentCount = 0;

    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach(res => {
        try {
          res.write(message);
          sentCount++;
        } catch (error) {
          console.error(`Error broadcasting to user ${userId}:`, error.message);
        }
      });
    });

    console.log(`📢 Broadcast sent to ${sentCount} connection(s)`);
    return sentCount;
  }

  /**
   * Check if user is connected
   * @param {string} userId - User ID
   * @returns {boolean}
   */
  isUserConnected(userId) {
    const connections = this.connections.get(userId);
    return connections && connections.length > 0;
  }

  /**
   * Get number of active connections for a user
   * @param {string} userId - User ID
   * @returns {number}
   */
  getUserConnectionCount(userId) {
    const connections = this.connections.get(userId);
    return connections ? connections.length : 0;
  }

  /**
   * Get total number of active connections
   * @returns {number}
   */
  getTotalConnections() {
    let total = 0;
    this.connections.forEach(userConnections => {
      total += userConnections.length;
    });
    return total;
  }

  /**
   * Get all connected user IDs
   * @returns {Array<string>}
   */
  getConnectedUserIds() {
    return Array.from(this.connections.keys());
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
export default WebSocketService;
