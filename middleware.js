import BusinessError, { AuthError } from './models/errors';
import UsersController from './controllers/UsersController';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.code || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
  next();
};

// Middleware for token validation
export const validateToken = async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) {
    return next(new AuthError('Unauthorized'));
  }

  try {
    const user = await UsersController.getMe(token);
    req.user = user; // Attach user to request for further use
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware for logging
export const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

// Middleware for body validation
export const validateRequestBody = (requiredFields) => (req, res, next) => {
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return next(new BusinessError(`Missing fields: ${missingFields.join(', ')}`));
  }
  next();
};

export default errorHandler;
