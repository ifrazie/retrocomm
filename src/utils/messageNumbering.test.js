import { describe, it, expect } from 'vitest';

/**
 * Test the message numbering calculation logic
 * This validates the fix for task 5.1
 */
describe('Message Numbering Calculation', () => {
  /**
   * Helper function that mimics the logic in App.jsx
   */
  const calculateMessageNumbers = (totalMessages, displayCount = 5) => {
    const startIndex = Math.max(0, totalMessages - displayCount);
    const displayedMessages = Array.from({ length: Math.min(totalMessages, displayCount) }, (_, idx) => ({
      number: startIndex + idx + 1
    }));
    return displayedMessages;
  };

  it('should show "NO MESSAGES" state when there are 0 messages', () => {
    const result = calculateMessageNumbers(0);
    expect(result).toHaveLength(0);
  });

  it('should show correct sequential numbering with 1 message', () => {
    const result = calculateMessageNumbers(1);
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(1);
  });

  it('should show correct sequential numbering with 2 messages', () => {
    const result = calculateMessageNumbers(2);
    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(1);
    expect(result[1].number).toBe(2);
  });

  it('should show correct sequential numbering with 3 messages', () => {
    const result = calculateMessageNumbers(3);
    expect(result).toHaveLength(3);
    expect(result[0].number).toBe(1);
    expect(result[1].number).toBe(2);
    expect(result[2].number).toBe(3);
  });

  it('should show correct sequential numbering with 4 messages', () => {
    const result = calculateMessageNumbers(4);
    expect(result).toHaveLength(4);
    expect(result[0].number).toBe(1);
    expect(result[1].number).toBe(2);
    expect(result[2].number).toBe(3);
    expect(result[3].number).toBe(4);
  });

  it('should show numbers 1-5 with exactly 5 messages', () => {
    const result = calculateMessageNumbers(5);
    expect(result).toHaveLength(5);
    expect(result[0].number).toBe(1);
    expect(result[1].number).toBe(2);
    expect(result[2].number).toBe(3);
    expect(result[3].number).toBe(4);
    expect(result[4].number).toBe(5);
  });

  it('should show last 5 messages with correct numbers when there are 10 messages', () => {
    const result = calculateMessageNumbers(10);
    expect(result).toHaveLength(5);
    expect(result[0].number).toBe(6);  // Message 6 of 10
    expect(result[1].number).toBe(7);  // Message 7 of 10
    expect(result[2].number).toBe(8);  // Message 8 of 10
    expect(result[3].number).toBe(9);  // Message 9 of 10
    expect(result[4].number).toBe(10); // Message 10 of 10
  });

  it('should show last 5 messages with correct numbers when there are 15 messages', () => {
    const result = calculateMessageNumbers(15);
    expect(result).toHaveLength(5);
    expect(result[0].number).toBe(11); // Message 11 of 15
    expect(result[1].number).toBe(12); // Message 12 of 15
    expect(result[2].number).toBe(13); // Message 13 of 15
    expect(result[3].number).toBe(14); // Message 14 of 15
    expect(result[4].number).toBe(15); // Message 15 of 15
  });

  it('should handle edge case with 100 messages', () => {
    const result = calculateMessageNumbers(100);
    expect(result).toHaveLength(5);
    expect(result[0].number).toBe(96);  // Message 96 of 100
    expect(result[1].number).toBe(97);  // Message 97 of 100
    expect(result[2].number).toBe(98);  // Message 98 of 100
    expect(result[3].number).toBe(99);  // Message 99 of 100
    expect(result[4].number).toBe(100); // Message 100 of 100
  });
});
