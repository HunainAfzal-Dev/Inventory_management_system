/**
 * 🚦 Auth Routes
 * 
 * Defines the URL endpoints for authentication.
 * Routes just wire up: HTTP Method + Path → Middleware(s) → Controller
 * 
 * 🧠 Request Flow:
 *   Client Request → Route → Validation Middleware → Controller → Response
 * 
 * Example flow for POST /api/auth/signup:
 *   1. Request hits POST /api/auth/signup
 *   2. validate(signupSchema, 'body') validates req.body
 *   3. authController.signup handles the request
 *   4. Response sent back to client
 * 
 * @module authRoutes
 */

const express = require('express');
const router = express.Router();

// Import controllers (thin request/response handlers)
const authController = require('../controllers/auth.controller');

// Import validators (Joi schemas)
const { signupSchema, loginSchema } = require('../validators/auth.validator');

// Import validation middleware
const validate = require('../middleware/validate.middleware');

// ========== AUTH ROUTES ==========

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public (no authentication needed)
 * 
 * Middleware chain:
 * 1. validate(signupSchema) → Validates req.body against signup schema
 * 2. authController.signup → Creates user and returns JWT token
 */
router.post(
    '/signup',
    validate(signupSchema, 'body'),
    authController.signup
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate existing user
 * @access  Public (no authentication needed)
 * 
 * Middleware chain:
 * 1. validate(loginSchema) → Validates req.body against login schema
 * 2. authController.login → Verifies credentials and returns JWT token
 */
router.post(
    '/login',
    validate(loginSchema, 'body'),
    authController.login
);

module.exports = router;

