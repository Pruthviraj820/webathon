/**
 * Central error-handling middleware.
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  // PostgreSQL unique-constraint error → 409
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate entry' });
  }

  // PostgreSQL check-constraint / foreign-key error → 400
  if (err.code === '23503' || err.code === '23514') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Default to 500
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
