/**
 * 🚦 Products Routes
 * 
 * Defines URL endpoints for product CRUD operations.
 * Some routes are PROTECTED (require valid JWT token).
 * 
 * 🔐 Protected Routes:
 * Routes that modify data (create, update, delete) require authentication.
 * The authMiddleware checks the JWT token from the Authorization header.
 * 
 * 📖 Public Routes:
 * Read-only routes could be public or protected depending on your app's needs.
 * 
 * @module productRoutes
 */

const express = require('express');
const router = express.Router();

// Import controllers
const productsController = require('../controllers/products.controller');

// Import validators
const {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    userIdSchema
} = require('../validators/products.validator');

// Import middleware
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');

// ===== APPLY AUTH MIDDLEWARE TO ALL PRODUCT ROUTES =====
// Instead of adding authMiddleware to each route individually,
// we can apply it at the router level.
// All routes defined below will require authentication.
// 
// To make some routes public, define them BEFORE this line.
router.use(authMiddleware);

// ========== PRODUCT CRUD ROUTES ==========

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Protected (requires JWT token)
 * 
 * Middleware chain:
 * 1. authMiddleware → Verifies JWT, attaches user to req.user
 * 2. validate(createProductSchema) → Validates req.body
 * 3. productsController.createProduct → Creates product in DB
 */
router.post(
    '/',
    validate(createProductSchema, 'body'),
    productsController.createProduct
);

/**
 * @route   GET /api/products
 * @desc    Get all products (admin use)
 * @access  Protected
 */
router.get(
    '/',
    productsController.getAllProducts
);

/**
 * @route   GET /api/products/user/:user_id
 * @desc    Get all products for a specific user
 * @access  Protected
 */
router.get(
    '/user/:user_id',
    validate(userIdSchema, 'params'),
    productsController.getProductsByUser
);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Protected
 */
router.get(
    '/:id',
    validate(productIdSchema, 'params'),
    productsController.getProductById
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Protected
 */
router.put(
    '/:id',
    validate(productIdSchema, 'params'),
    validate(updateProductSchema, 'body'),
    productsController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Protected
 */
router.delete(
    '/:id',
    validate(productIdSchema, 'params'),
    productsController.deleteProduct
);

module.exports = router;

