/**
 * 🚀 Server Entry Point
 * 
 * This is the starting point of our application.
 * It imports the configured Express app and starts listening for HTTP requests.
 * 
 * 🧠 Why separate app.js and server.js?
 * - app.js: Creates and configures the Express application (middleware, routes)
 * - server.js: Starts listening on a port
 * 
 * Benefits:
 * - Our app can be imported in tests without starting a server
 * - Clean separation of concerns
 * 
 * @module server
 */

// ===== LOAD ENVIRONMENT VARIABLES =====
// Must be first! Other modules need these variables
require('dotenv').config();

// Import the configured Express application
const app = require('./app');

// ===== HANDLE UNCAUGHT EXCEPTIONS (safety net) =====
// These are programming bugs that throw before Express catches them
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});

// ===== HANDLE UNHANDLED PROMISE REJECTIONS (safety net) =====
// These are async errors that weren't caught by our catchAsync wrapper
process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// ===== START THE SERVER =====
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Export server (useful for testing)
module.exports = server;

