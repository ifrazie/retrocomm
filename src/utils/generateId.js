/**
 * Generates a unique identifier for messages
 * Uses timestamp + random number for collision-free IDs
 * @returns {string} Unique identifier in format: msg_timestamp_randomstring
 */
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
