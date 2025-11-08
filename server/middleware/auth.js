/**
 * Authentication middleware for webhook endpoints
 * Validates Bearer tokens from Authorization header
 */

const authMiddleware = (req, res, next) => {
  // Check if auth is enabled via environment variable
  const authEnabled = process.env.AUTH_ENABLED === 'true';
  
  if (!authEnabled) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const expectedToken = process.env.AUTH_TOKEN;

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;

  // Validate token
  if (!expectedToken || token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

export default authMiddleware;
