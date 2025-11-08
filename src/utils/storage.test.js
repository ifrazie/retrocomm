import { describe, it, expect, beforeEach } from 'vitest';
import {
  getItem,
  setItem,
  removeItem,
  getConfig,
  saveConfig,
  getWebhookSettings,
  saveWebhookSettings,
  getPreferences,
  savePreferences,
  getMessageHistory,
  saveMessageHistory,
  addMessageToHistory,
  clearMessageHistory,
  clearAllData,
  STORAGE_KEYS
} from './storage.js';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getItem and setItem', () => {
    it('should store and retrieve values', () => {
      const testData = { foo: 'bar' };
      setItem('test-key', testData);
      const result = getItem('test-key');
      expect(result).toEqual(testData);
    });

    it('should return default value for non-existent keys', () => {
      const result = getItem('non-existent', 'default');
      expect(result).toBe('default');
    });

    it('should return null as default when no default provided', () => {
      const result = getItem('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove items from storage', () => {
      setItem('test-key', 'value');
      removeItem('test-key');
      const result = getItem('test-key');
      expect(result).toBeNull();
    });
  });

  describe('Config management', () => {
    it('should save and retrieve config', () => {
      const config = {
        webhooks: { incomingUrl: 'https://example.com' },
        preferences: { mode: 'pager' },
        messageHistory: []
      };
      saveConfig(config);
      const result = getConfig();
      expect(result).toEqual(config);
    });
  });

  describe('Webhook settings', () => {
    it('should save and retrieve webhook settings', () => {
      const webhooks = {
        incomingUrl: 'https://example.com/in',
        outgoingUrl: 'https://example.com/out',
        authToken: 'token123',
        enableAuth: true
      };
      saveWebhookSettings(webhooks);
      const result = getWebhookSettings();
      expect(result).toEqual(webhooks);
    });

    it('should return null when no config exists', () => {
      const result = getWebhookSettings();
      expect(result).toBeNull();
    });
  });

  describe('Preferences', () => {
    it('should save and retrieve preferences', () => {
      const preferences = {
        mode: 'fax',
        soundEnabled: true
      };
      savePreferences(preferences);
      const result = getPreferences();
      expect(result).toEqual(preferences);
    });
  });

  describe('Message history', () => {
    it('should save and retrieve message history', () => {
      const messages = [
        { id: '1', content: 'Test 1', timestamp: Date.now() },
        { id: '2', content: 'Test 2', timestamp: Date.now() }
      ];
      saveMessageHistory(messages);
      const result = getMessageHistory();
      expect(result).toEqual(messages);
    });

    it('should limit message history to 100 messages', () => {
      const messages = Array.from({ length: 150 }, (_, i) => ({
        id: String(i),
        content: `Message ${i}`,
        timestamp: Date.now()
      }));
      saveMessageHistory(messages);
      const result = getMessageHistory();
      expect(result.length).toBe(100);
      expect(result[0].id).toBe('50');
    });

    it('should add single message to history', () => {
      const message = { id: '1', content: 'Test', timestamp: Date.now() };
      addMessageToHistory(message);
      const result = getMessageHistory();
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(message);
    });

    it('should clear message history', () => {
      const messages = [{ id: '1', content: 'Test', timestamp: Date.now() }];
      saveMessageHistory(messages);
      clearMessageHistory();
      const result = getMessageHistory();
      expect(result).toEqual([]);
    });
  });

  describe('clearAllData', () => {
    it('should clear all storage data', () => {
      saveConfig({ webhooks: {}, preferences: {}, messageHistory: [] });
      saveMessageHistory([{ id: '1', content: 'Test', timestamp: Date.now() }]);
      
      clearAllData();
      
      expect(getConfig()).toBeNull();
      expect(getMessageHistory()).toEqual([]);
    });
  });
});
