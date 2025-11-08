import { describe, it, expect } from 'vitest';
import { sanitizeMessage, sanitizeAndTruncate } from './sanitize.js';

describe('sanitizeMessage', () => {
  it('should strip HTML tags from content', () => {
    const input = '<script>alert("xss")</script>Hello World';
    const result = sanitizeMessage(input);
    expect(result).toBe('Hello World');
  });

  it('should handle plain text without modification', () => {
    const input = 'Hello World';
    const result = sanitizeMessage(input);
    expect(result).toBe('Hello World');
  });

  it('should return empty string for null or undefined', () => {
    expect(sanitizeMessage(null)).toBe('');
    expect(sanitizeMessage(undefined)).toBe('');
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeMessage(123)).toBe('');
    expect(sanitizeMessage({})).toBe('');
    expect(sanitizeMessage([])).toBe('');
  });

  it('should trim whitespace from result', () => {
    const input = '  Hello World  ';
    const result = sanitizeMessage(input);
    expect(result).toBe('Hello World');
  });

  it('should strip all HTML attributes', () => {
    const input = '<a href="javascript:alert(1)" onclick="alert(2)">Click</a>';
    const result = sanitizeMessage(input);
    expect(result).toBe('Click');
  });
});

describe('sanitizeAndTruncate', () => {
  it('should sanitize and truncate long messages', () => {
    const input = 'A'.repeat(300);
    const result = sanitizeAndTruncate(input, 240);
    expect(result.length).toBe(240);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should not truncate short messages', () => {
    const input = 'Hello World';
    const result = sanitizeAndTruncate(input, 240);
    expect(result).toBe('Hello World');
  });

  it('should use default max length of 240', () => {
    const input = 'A'.repeat(300);
    const result = sanitizeAndTruncate(input);
    expect(result.length).toBe(240);
  });

  it('should sanitize HTML before truncating', () => {
    const input = '<script>alert("xss")</script>' + 'A'.repeat(300);
    const result = sanitizeAndTruncate(input, 240);
    expect(result).not.toContain('<script>');
    expect(result.length).toBe(240);
  });
});
