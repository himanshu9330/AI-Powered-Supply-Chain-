const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with this value already exists';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  } else if (err.code === '22P02') {
    statusCode = 400;
    message = 'Invalid UUID format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  logger.error(`[${statusCode}] ${req.method} ${req.path} — ${message}`, {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
