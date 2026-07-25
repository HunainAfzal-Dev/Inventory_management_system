/**
 * 📦 AppError - Custom Error Class
 * 
 * Extends the built-in JavaScript Error class with an HTTP status code.
 * This allows us to throw errors from anywhere in the application with
 * an associated HTTP status, which the global error handler middleware
 * uses to send proper HTTP responses.
 * 
 * ✅ Benefits:
 * - Consistent error structure across the app
 * - Clear separation between operational (expected) errors & programming bugs
 * - No more guessing status codes in catch blocks
 * 
 * 🧠 How it works:
 * - `message` → human-readable error description (inherited from Error)
 * - `statusCode` → HTTP status code (e.g., 404, 400, 500)
 * - `status` → derived from statusCode: 'fail' for 4xx, 'error' for 5xx
 * - `isOperational` → true = expected error (e.g., validation fail, not found)
 *                      false = unexpected bug (e.g., database connection issue)
 */

class AppError extends Error {
    /**
     * @param {string} message - Human-readable error description
     * @param {number} statusCode - HTTP status code (default: 500)
     */
    constructor(message, statusCode = 500) {
        // Call the parent Error class constructor with the message
        super(message);

        // Store the HTTP status code
        this.statusCode = statusCode;

        // Derive a short status label:
        // - 4xx (client errors) → 'fail'
        // - 5xx (server errors) → 'error'
        this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';

        // Mark this as an operational/expected error
        // When we build the global error handler, we'll distinguish
        // between operational errors (send to client) and programming
        // bugs (don't leak details, log instead)
        this.isOperational = true;

        // Capture the stack trace (removes this constructor from the trace)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;

