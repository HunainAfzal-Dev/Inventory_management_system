/**
 * ⚠️ Global Error Handler Middleware
 * 
 * This is Express's error-handling middleware (notice 4 parameters: err, req, res, next).
 * It sits at the END of the middleware chain, AFTER all routes.
 * 
 * 🧠 How it works:
 * - When any middleware/controller calls `next(err)` or throws an error,
 *   Express skips all normal middleware and jumps to this handler
 * - We inspect the error and determine what response to send back
 * - NEVER leak internal error details in production (security risk)
 * 
 * 🔐 Operational vs Programming Errors:
 * - Operational (isOperational = true): Expected errors like validation failure,
 *   not found, unauthorized → send error details to client
 * - Programming (isOperational = false): Unexpected bugs like database connection
 *   failure → send generic "Internal Server Error", log the real error
 * 
 * @param {Error} err - The error object (could be AppError or standard Error)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */

// Helper function to send error response in development (detailed)
const sendErrorDev = (err, res) => {
    console.error('❌ ERROR:', err); // Log full error for debugging
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message,
        error: err,           // Send the full error object
        stack: err.stack      // Send the stack trace (useful for debugging)
    });
};

// Helper function to send error response in production (safe)
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        console.error('❌ Operational Error:', err.message);
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Programming or unknown error: don't leak error details
        console.error('❌ UNEXPECTED ERROR:', err); // Log for debugging
        
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong! Please try again later.'
        });
    }
};

const errorHandler = (err, req, res, next) => {
    // Default values if the error doesn't have status info
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Determine environment and send appropriate response
    if (process.env.NODE_ENV === 'production') {
        // In production, don't leak implementation details
        sendErrorProd(err, res);
    } else {
        // In development, send detailed error info for debugging
        sendErrorDev(err, res);
    }
};

module.exports = errorHandler;
