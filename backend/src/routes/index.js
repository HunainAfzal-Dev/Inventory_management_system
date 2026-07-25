/**
 * 🚦 Route Aggregator
 * 
 * This is the central place where all route modules are mounted.
 * We import it once in app.js, and it registers all endpoints.
 * 
 * 🧠 Why aggregate here?
 * - app.js stays clean (just mounts one router at '/api')
 * - Adding new route modules is easy (just add one line here)
 * - Clear overview of API structure in one file
 * 
 * @module routeIndex
 */

const express = require('express');
const router = express.Router();

// ===== MOUNT ROUTE MODULES =====

// Auth routes: /api/auth/signup, /api/auth/login
const authRoutes = require('./auth.routes');
router.use('/auth', authRoutes);

// Products routes: /api/products, /api/products/:id, etc.
const productRoutes = require('./products.routes');
router.use('/products', productRoutes);

module.exports = router;

