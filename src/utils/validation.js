/**
 * URL validation utilities for webhook configuration
 */

/**
 * Validates if a string is a valid URL
 * 
 * @param {string} url - URL string to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObject = new URL(url);
    // Only allow http and https protocols
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

/**
 * Validates webhook URL format
 * Ensures URL is valid and uses http/https protocol
 * 
 * @param {string} url - Webhook URL to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateWebhookUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: 'URL is required'
    };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    return {
      valid: false,
      error: 'URL cannot be empty'
    };
  }

  try {
    const urlObject = new URL(trimmedUrl);
    
    if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
      return {
        valid: false,
        error: 'URL must use http or https protocol'
      };
    }

    if (!urlObject.hostname) {
      return {
        valid: false,
        error: 'URL must have a valid hostname'
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format'
    };
  }
};

/**
 * Validates webhook settings object
 * 
 * @param {import('../types/index.js').WebhookSettings} settings - Webhook settings to validate
 * @returns {{ valid: boolean, errors: Object.<string, string> }} Validation result with field-specific errors
 */
export const validateWebhookSettings = (settings) => {
  const errors = {};

  if (!settings) {
    return {
      valid: false,
      errors: { general: 'Settings object is required' }
    };
  }

  // Validate incoming URL
  if (settings.incomingUrl) {
    const incomingValidation = validateWebhookUrl(settings.incomingUrl);
    if (!incomingValidation.valid) {
      errors.incomingUrl = incomingValidation.error;
    }
  }

  // Validate outgoing URL
  if (settings.outgoingUrl) {
    const outgoingValidation = validateWebhookUrl(settings.outgoingUrl);
    if (!outgoingValidation.valid) {
      errors.outgoingUrl = outgoingValidation.error;
    }
  }

  // Validate auth token if auth is enabled
  if (settings.enableAuth && (!settings.authToken || settings.authToken.trim().length === 0)) {
    errors.authToken = 'Auth token is required when authentication is enabled';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitizes URL by trimming whitespace
 * 
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  return url.trim();
};
