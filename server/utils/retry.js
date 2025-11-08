/**
 * Retry utility with exponential backoff
 * Attempts a function up to maxAttempts times with increasing delays
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum number of attempts (default: 3)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @returns {Promise} - Result of the function or throws error
 */
export const retryWithBackoff = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      // Log successful attempt
      if (attempt > 1) {
        console.log(`Success on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);

      // Don't wait after the last attempt
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All attempts failed
  throw lastError;
};
