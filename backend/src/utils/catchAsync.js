/**
 * 🔄 catchAsync - Async Error Wrapper for Express Route Handlers
 * 
 * Express does NOT automatically catch errors thrown inside async route
 * handlers. If an async function throws, Express will crash (unhandled
 * promise rejection). This wrapper catches those errors and passes them
 * to the NEXT middleware in the chain (typically the global error handler).
 * 
 * 
 * 🧠 How it works:
 * 1. Accepts an async function `fn` as input
 * 2. Returns a NEW function that Express can call as a route handler
 * 3. When the returned function is called, it invokes `fn` with req, res, next
 * 4. If `fn` resolves → nothing special happens, response is sent normally
 * 5. If `fn` rejects (throws) → `.catch(next)` forwards the error to Express
 *    error-handling middleware
 * 
 * ✅ Before (boilerplate in every controller):
 *    try {
 *        // logic
 *    } catch (err) {
 *        next(err);
 *    }
 * 
 * ✅ After (clean, readable):
 *    const myHandler = catchAsync(async (req, res, next) => {
 *        // logic (throw any error, it's automatically caught)
 *    });
 * 
 * @param {Function} fn - An async route handler function (req, res, next) => Promise
 * @returns {Function} A wrapped function that forwards errors to Express error handler
 */

module.exports = (fn) => {
    // Return a new function that Express will call
    return (req, res, next) => {
        // Execute the original function and catch any rejected promise
        // .catch(next) passes the error to Express's error handling middleware
        fn(req, res, next).catch(next);
    };
};

