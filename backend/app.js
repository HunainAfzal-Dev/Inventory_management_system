/**
 * 🏗️ Express Application Setup
 * 
 * This file creates and configures the Express application.
 * It is separated from server.js so that:
 * 1. We can import app in tests without starting the server
 * 2. app.js handles "what middleware/routes to use"
 * 3. server.js handles "when to start listening"
 * 
 * 🧠 Middleware Order Matters!
 * Express executes middleware in the order they are registered:
 * 1. CORS → Security headers
 * 2. JSON parser → Parse request bodies
 * 3. Routes → Handle API requests
 * 4. 404 handler → Catch unmatched routes
 * 5. Error handler → Handle errors from anywhere above
 * 
 * @module app
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// ===== IMPORT MIDDLEWARE =====
const errorHandler = require('./src/middleware/errorHandler');

// ===== IMPORT ROUTES =====
const apiRoutes = require('./src/routes/index');

// ===== CREATE EXPRESS APP =====
const app = express();

// ===== 1️⃣ GLOBAL MIDDLEWARE =====

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend from a different origin to call this API
app.use(cors());

// Parse incoming requests with JSON payloads
// Without this, req.body would be undefined
app.use(express.json());

// ===== 2️⃣ HEALTH CHECK ROUTE =====
// GET /api/health - Simple endpoint to verify server is running
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Success',
        message: '🚀 Server is running smoothly!',
        timestamp: new Date().toISOString()
    });
});

// ===== 3️⃣ MOUNT API ROUTES =====
// All routes defined in /src/routes are mounted under /api
// Example: /api/auth/signup, /api/products, etc.
app.use('/api', apiRoutes);

// ===== 4️⃣ 404 HANDLER (for unmatched routes) =====
// If no route matched above, the request reaches here
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// ===== 5️⃣ GLOBAL ERROR HANDLER =====
// Must be the LAST middleware (4 parameters = error handler)
// Catches errors from ALL middleware and controllers above
app.use(errorHandler);

// Export the app (server.js will import and start it)
module.exports = app;

