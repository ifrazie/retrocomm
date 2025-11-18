/**
 * LocalStorage helper utilities for configuration and message persistence
 */

import { logger } from './logger.js';

const STORAGE_KEYS = {
  CONFIG: 'retro_messenger_config',
  MESSAGES: 'retro_messenger_messages',
  PREFERENCES: 'retro_messenger_preferences'
};

/**
 * Gets a value from LocalStorage
 * 
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    logger.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Sets a value in LocalStorage
 * 
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Removes a value from LocalStorage
 * 
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Gets the complete app configuration
 * 
 * @returns {import('../types/index.js').AppConfig|null} App configuration or null
 */
export const getConfig = () => {
  return getItem(STORAGE_KEYS.CONFIG, null);
};

/**
 * Saves the complete app configuration
 * 
 * @param {import('../types/index.js').AppConfig} config - Configuration to save
 * @returns {boolean} Success status
 */
export const saveConfig = (config) => {
  return setItem(STORAGE_KEYS.CONFIG, config);
};

/**
 * Gets webhook settings from configuration
 * 
 * @returns {import('../types/index.js').WebhookSettings|null} Webhook settings or null
 */
export const getWebhookSettings = () => {
  const config = getConfig();
  return config?.webhooks || null;
};

/**
 * Saves webhook settings to configuration
 * 
 * @param {import('../types/index.js').WebhookSettings} webhooks - Webhook settings
 * @returns {boolean} Success status
 */
export const saveWebhookSettings = (webhooks) => {
  const config = getConfig() || { webhooks: {}, preferences: {}, messageHistory: [] };
  config.webhooks = webhooks;
  return saveConfig(config);
};

/**
 * Gets user preferences from configuration
 * 
 * @returns {import('../types/index.js').AppPreferences|null} User preferences or null
 */
export const getPreferences = () => {
  const config = getConfig();
  return config?.preferences || null;
};

/**
 * Saves user preferences to configuration
 * 
 * @param {import('../types/index.js').AppPreferences} preferences - User preferences
 * @returns {boolean} Success status
 */
export const savePreferences = (preferences) => {
  const config = getConfig() || { webhooks: {}, preferences: {}, messageHistory: [] };
  config.preferences = preferences;
  return saveConfig(config);
};

/**
 * Gets message history from storage
 * 
 * @param {number} maxMessages - Maximum number of messages to return (default: 100)
 * @returns {import('../types/index.js').Message[]} Array of messages
 */
export const getMessageHistory = (maxMessages = 100) => {
  const messages = getItem(STORAGE_KEYS.MESSAGES, []);
  return messages.slice(-maxMessages);
};

/**
 * Saves message history to storage
 * Automatically limits to max 100 messages
 * 
 * @param {import('../types/index.js').Message[]} messages - Messages to save
 * @returns {boolean} Success status
 */
export const saveMessageHistory = (messages) => {
  const limitedMessages = messages.slice(-100);
  return setItem(STORAGE_KEYS.MESSAGES, limitedMessages);
};

/**
 * Adds a single message to history
 * 
 * @param {import('../types/index.js').Message} message - Message to add
 * @returns {boolean} Success status
 */
export const addMessageToHistory = (message) => {
  const messages = getMessageHistory();
  messages.push(message);
  return saveMessageHistory(messages);
};

/**
 * Clears message history
 * 
 * @returns {boolean} Success status
 */
export const clearMessageHistory = () => {
  return removeItem(STORAGE_KEYS.MESSAGES);
};

/**
 * Clears all app data from storage
 * 
 * @returns {boolean} Success status
 */
export const clearAllData = () => {
  try {
    removeItem(STORAGE_KEYS.CONFIG);
    removeItem(STORAGE_KEYS.MESSAGES);
    removeItem(STORAGE_KEYS.PREFERENCES);
    return true;
  } catch (error) {
    logger.error('Error clearing all data:', error);
    return false;
  }
};

export { STORAGE_KEYS };
