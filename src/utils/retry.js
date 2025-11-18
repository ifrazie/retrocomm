/**
 * Retry Utility
 * Implements exponential backoff retry logic for failed operations
 */

import { logger } from './logger.js';

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum number of attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in milliseconds (default: 1000)
 * @param {Function} options.onRetry - Callback called on each retry attempt
 * @returns {Promise<any>} Result of the function
 * @throws {Error} Last error if all attempts fail
 */
export const retryWithBackoff = async (
  fn,
  {
    maxAttempts = 3,
    baseDelay = 1000,
    onRetry = () => {}
  } = {}
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      // Log successful attempt
      if (attempt > 1) {
        logger.info(`Operation succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Log failed attempt
      logger.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        logger.error(`All ${maxAttempts} attempts failed. Last error:`, error);
        throw error;
      }
      
      // Calculate delay with exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt - 1);
      
      // Call retry callback
      onRetry(attempt, delay, error);
      
      logger.info(`Retrying in ${delay}ms...`);
      
      // Wait before next attempt
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript/ESLint might complain
  throw lastError;
};

/**
 * Retry a fetch request with exponential backoff
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {Object} retryOptions - Retry options
 * @returns {Promise<Response>} Fetch response
 */
export const retryFetch = async (url, options = {}, retryOptions = {}) => {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, options);
      
      // Consider 4xx and 5xx as errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    },
    retryOptions
  );
};
