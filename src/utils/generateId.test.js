import { describe, it, expect } from 'vitest';
import { generateMessageId } from './generateId.js';

describe('generateMessageId', () => {
  it('should return a string', () => {
    const id = generateMessageId();
    expect(typeof id).toBe('string');
  });

  it('should generate unique IDs across multiple calls', () => {
    const ids = new Set();
    const iterations = 1000;
    
    for (let i = 0; i < iterations; i++) {
      ids.add(generateMessageId());
    }
    
    // All IDs should be unique
    expect(ids.size).toBe(iterations);
  });

  it('should follow expected format (msg_timestamp_random)', () => {
    const id = generateMessageId();
    
    // Should match pattern: msg_<numbers>_<alphanumeric>
    const pattern = /^msg_\d+_[a-z0-9]+$/;
    expect(id).toMatch(pattern);
  });

  it('should have three parts separated by underscores', () => {
    const id = generateMessageId();
    const parts = id.split('_');
    
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe('msg');
    expect(parts[1]).toMatch(/^\d+$/); // timestamp should be all digits
    expect(parts[2].length).toBeGreaterThan(0); // random part should exist
  });

  it('should generate IDs with timestamps close to current time', () => {
    const beforeTime = Date.now();
    const id = generateMessageId();
    const afterTime = Date.now();
    
    const parts = id.split('_');
    const timestamp = parseInt(parts[1], 10);
    
    expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(timestamp).toBeLessThanOrEqual(afterTime);
  });
});
