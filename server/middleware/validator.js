/**
 * Message validation middleware
 * Validates JSON payload structure and sanitizes content
 */

/**
 * Simple HTML sanitization to prevent XSS attacks
 * Strips HTML tags and encodes special characters
 */
const sanitizeContent = (content) => {
  if (typeof content !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '');
  
  // Encode special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
};

/**
 * Validates webhook payload structure
 */
const validateMessageMiddleware = (req, res, next) => {
  const { message, sender, timestamp, metadata } = req.body;

  // Validate required field: message
  if (!message) {
    return res.status(400).json({ 
      error: 'Invalid payload', 
      details: ['message field is required'] 
    });
  }

  // Validate message type
  if (typeof message !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid payload', 
      details: ['message must be a string'] 
    });
  }

  // Sanitize message content
  req.body.message = sanitizeContent(message);

  // Sanitize optional sender field
  if (sender && typeof sender === 'string') {
    req.body.sender = sanitizeContent(sender);
  }

  // Validate timestamp if provided
  if (timestamp !== undefined && typeof timestamp !== 'number') {
    return res.status(400).json({ 
      error: 'Invalid payload', 
      details: ['timestamp must be a number'] 
    });
  }

  // Validate metadata if provided
  if (metadata !== undefined && typeof metadata !== 'object') {
    return res.status(400).json({ 
      error: 'Invalid payload', 
      details: ['metadata must be an object'] 
    });
  }

  next();
};

export default validateMessageMiddleware;
