import { describe, it, expect, vi } from 'vitest';
import { retryWithBackoff, retryFetch } from './retry.js';

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn);
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockResolvedValueOnce('success');
    
    const result = await retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10 });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw error after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));
    
    await expect(
      retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10 })
    ).rejects.toThrow('Always fails');
    
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should call onRetry callback on each retry', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce('success');
    
    const onRetry = vi.fn();
    
    await retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10, onRetry });
    
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(1, 10, expect.any(Error));
    expect(onRetry).toHaveBeenCalledWith(2, 20, expect.any(Error));
  });

  it('should use exponential backoff delays', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce('success');
    
    const delays = [];
    const onRetry = vi.fn((attempt, delay) => {
      delays.push(delay);
    });
    
    await retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 100, onRetry });
    
    expect(delays).toEqual([100, 200]);
  });
});

describe('retryFetch', () => {
  it('should succeed on successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' })
    });
    
    const result = await retryFetch('https://example.com', {}, { maxAttempts: 3, baseDelay: 10 });
    
    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on failed fetch', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    
    const result = await retryFetch('https://example.com', {}, { maxAttempts: 3, baseDelay: 10 });
    
    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw error after max attempts', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    await expect(
      retryFetch('https://example.com', {}, { maxAttempts: 3, baseDelay: 10 })
    ).rejects.toThrow('HTTP 500: Internal Server Error');
    
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
