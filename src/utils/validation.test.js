import { describe, it, expect } from 'vitest';
import { 
  isValidUrl, 
  validateWebhookUrl, 
  validateWebhookSettings,
  sanitizeUrl 
} from './validation.js';

describe('isValidUrl', () => {
  it('should validate correct HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('http://example.com/webhook')).toBe(true);
  });

  it('should validate correct HTTPS URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://api.example.com/webhook')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });

  it('should reject null or undefined', () => {
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
  });

  it('should reject non-string input', () => {
    expect(isValidUrl(123)).toBe(false);
    expect(isValidUrl({})).toBe(false);
  });
});

describe('validateWebhookUrl', () => {
  it('should validate correct webhook URLs', () => {
    const result = validateWebhookUrl('https://example.com/webhook');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty URLs', () => {
    const result = validateWebhookUrl('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL is required');
  });

  it('should reject URLs without http/https protocol', () => {
    const result = validateWebhookUrl('ftp://example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must use http or https protocol');
  });

  it('should reject malformed URLs', () => {
    const result = validateWebhookUrl('not a url');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid URL format');
  });

  it('should trim whitespace before validation', () => {
    const result = validateWebhookUrl('  https://example.com  ');
    expect(result.valid).toBe(true);
  });
});

describe('validateWebhookSettings', () => {
  it('should validate correct settings', () => {
    const settings = {
      incomingUrl: 'https://example.com/incoming',
      outgoingUrl: 'https://example.com/outgoing',
      authToken: 'token123',
      enableAuth: true
    };
    const result = validateWebhookSettings(settings);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should reject invalid incoming URL', () => {
    const settings = {
      incomingUrl: 'not-a-url',
      outgoingUrl: 'https://example.com/outgoing'
    };
    const result = validateWebhookSettings(settings);
    expect(result.valid).toBe(false);
    expect(result.errors.incomingUrl).toBeDefined();
  });

  it('should reject invalid outgoing URL', () => {
    const settings = {
      incomingUrl: 'https://example.com/incoming',
      outgoingUrl: 'not-a-url'
    };
    const result = validateWebhookSettings(settings);
    expect(result.valid).toBe(false);
    expect(result.errors.outgoingUrl).toBeDefined();
  });

  it('should require auth token when auth is enabled', () => {
    const settings = {
      enableAuth: true,
      authToken: ''
    };
    const result = validateWebhookSettings(settings);
    expect(result.valid).toBe(false);
    expect(result.errors.authToken).toBeDefined();
  });

  it('should allow empty auth token when auth is disabled', () => {
    const settings = {
      incomingUrl: 'https://example.com/incoming',
      enableAuth: false,
      authToken: ''
    };
    const result = validateWebhookSettings(settings);
    expect(result.valid).toBe(true);
  });
});

describe('sanitizeUrl', () => {
  it('should trim whitespace from URLs', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
  });

  it('should return empty string for null or undefined', () => {
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeUrl(123)).toBe('');
  });
});
