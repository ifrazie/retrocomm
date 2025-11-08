/**
 * @typedef {Object} Message
 * @property {string} id - UUID v4 identifier
 * @property {string} content - Sanitized message text
 * @property {number} timestamp - Unix timestamp in milliseconds
 * @property {string} [sender] - Optional sender identifier
 * @property {Object} [metadata] - Optional metadata
 * @property {string} [metadata.platform] - Source platform (e.g., "slack", "discord")
 * @property {string} [metadata.channelId] - Source channel/room identifier
 */

/**
 * @typedef {Object} WebhookSettings
 * @property {string} incomingUrl - Backend webhook URL
 * @property {string} outgoingUrl - External chatbot webhook URL
 * @property {string} [authToken] - Optional authentication token
 * @property {boolean} enableAuth - Authentication toggle
 */

/**
 * @typedef {Object} AppPreferences
 * @property {'pager' | 'fax'} mode - Current interface mode
 * @property {boolean} soundEnabled - Notification sound toggle
 */

/**
 * @typedef {Object} AppConfig
 * @property {WebhookSettings} webhooks - Webhook configuration
 * @property {AppPreferences} preferences - User preferences
 * @property {Message[]} messageHistory - Persisted messages (max 100)
 */

/**
 * @typedef {Object} ConnectionStatus
 * @property {boolean} connected - Connection state
 * @property {string} [error] - Optional error message
 * @property {number} lastUpdate - Last update timestamp
 */

/**
 * @typedef {Object} FaxDocument
 * @property {string} id - UUID v4 identifier
 * @property {string} imageDataUrl - Base64 encoded image data URL
 * @property {number} timestamp - Unix timestamp in milliseconds
 * @property {string} [sender] - Optional sender identifier
 */

// Export empty object to make this a module
export {};
