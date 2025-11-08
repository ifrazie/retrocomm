import DOMPurify from 'dompurify';

/**
 * Sanitizes message content to prevent XSS attacks
 * Strips all HTML tags and returns plain text
 * 
 * @param {string} content - Raw message content
 * @returns {string} Sanitized plain text
 */
export const sanitizeMessage = (content) => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Configure DOMPurify to strip all HTML tags
  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  return cleanContent.trim();
};

/**
 * Sanitizes and truncates message content to specified length
 * 
 * @param {string} content - Raw message content
 * @param {number} maxLength - Maximum length (default: 240 for pager)
 * @returns {string} Sanitized and truncated text
 */
export const sanitizeAndTruncate = (content, maxLength = 240) => {
  const sanitized = sanitizeMessage(content);
  
  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  return sanitized.substring(0, maxLength - 3) + '...';
};
