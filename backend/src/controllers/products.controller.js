/**
 * 📦 Products Controller
 * 
 * Thin request/response handlers for product endpoints.
 * All business logic is delegated to products.service.js.
 * 
 * @module productsController
 */

const catchAsync = require('../utils/catchAsync');
const productsService = require('../services/products.service');

/**
 * ✨ POST /api/products - Create a new product
 */
const createProduct = catchAsync(async (req, res, next) => {
    // Create the product using the service layer
    const product = await productsService.createProduct(req.body);

    res.status(201).json({
        status: 'Success',
        message: 'Product added successfully.',
        data: { product }
    });
});

/**
 * 📋 GET /api/products - Get all products
 */
const getAllProducts = catchAsync(async (req, res, next) => {
    const products = await productsService.getAllProducts();

    res.status(200).json({
        status: 'Success',
        count: products.length,
        data: { products }
    });
});

/**
 * 🔍 GET /api/products/:id - Get a single product by ID
 */
const getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await productsService.getProductById(id);

    res.status(200).json({
        status: 'Success',
        data: { product }
    });
});

/**
 * 👤 GET /api/products/user/:user_id - Get all products for a user
 */
const getProductsByUser = catchAsync(async (req, res, next) => {
    const { user_id } = req.params;
    const products = await productsService.getProductsByUser(user_id);

    res.status(200).json({
        status: 'Success',
        count: products.length,
        data: { products }
    });
});

/**
 * 📝 PUT /api/products/:id - Update a product
 */
const updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await productsService.updateProduct(id, req.body);

    res.status(200).json({
        status: 'Success',
        message: 'Product updated successfully.',
        data: { product }
    });
});

/**
 * 🗑️ DELETE /api/products/:id - Delete a product
 */
const deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedId = await productsService.deleteProduct(id);

    res.status(200).json({
        status: 'Success',
        message: 'Product deleted successfully.',
        data: { deleted_product_id: deletedId }
    });
});

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductsByUser,
    updateProduct,
    deleteProduct
};

