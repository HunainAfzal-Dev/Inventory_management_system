/**
 * ✅ Products Validation Schemas (Joi)
 * 
 * Defines the expected shape of product data at every endpoint.
 * The validate middleware checks requests against these schemas
 * BEFORE they reach controllers/services.
 * 
 * @module productsValidators
 */

const Joi = require('joi');

/**
 * 📦 Create Product Validation Schema
 * 
 * Rules:
 * - user_id: UUID format, required
 * - name: 2-100 characters, required
 * - sku: 3-50 characters, alphanumeric with dashes, required
 * - category: Optional, up to 50 characters
 * - buy_price: Positive number (max 1M), required
 * - sale_price: Positive number (max 1M), required, must be >= buy_price
 * - stock_quantity: Non-negative integer, required
 * - low_stock_threshold: Optional non-negative integer
 * - created_at: Optional ISO date string
 */
const createProductSchema = Joi.object({
    user_id: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'User ID must be a valid UUID',
            'any.required': 'User ID is required'
        }),

    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Product name must be at least 2 characters',
            'string.max': 'Product name cannot exceed 100 characters',
            'any.required': 'Product name is required'
        }),

    sku: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[A-Za-z0-9-]+$/)
        .required()
        .messages({
            'string.min': 'SKU must be at least 3 characters',
            'string.max': 'SKU cannot exceed 50 characters',
            'string.pattern.base': 'SKU can only contain letters, numbers, and dashes',
            'any.required': 'SKU is required'
        }),

    category: Joi.string()
        .max(50)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Category cannot exceed 50 characters'
        }),

    buy_price: Joi.number()
        .positive()
        .max(1000000)
        .required()
        .messages({
            'number.positive': 'Buy price must be greater than 0',
            'number.max': 'Buy price cannot exceed 1,000,000',
            'any.required': 'Buy price is required'
        }),

    sale_price: Joi.number()
        .positive()
        .max(1000000)
        .required()
        .messages({
            'number.positive': 'Sale price must be greater than 0',
            'number.max': 'Sale price cannot exceed 1,000,000',
            'any.required': 'Sale price is required'
        }),

    stock_quantity: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.integer': 'Stock quantity must be a whole number',
            'number.min': 'Stock quantity cannot be negative',
            'any.required': 'Stock quantity is required'
        }),

    low_stock_threshold: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            'number.integer': 'Low stock threshold must be a whole number',
            'number.min': 'Low stock threshold cannot be negative'
        }),

    created_at: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.format': 'Created at must be a valid ISO date string'
        })
});

/**
 * 🔍 Product ID Validation Schema (for params)
 * 
 * Validates that the :id parameter is a valid UUID format.
 */
const productIdSchema = Joi.object({
    id: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'Product ID must be a valid UUID format',
            'any.required': 'Product ID is required'
        })
});

/**
 * 👤 User ID Validation Schema (for params)
 */
const userIdSchema = Joi.object({
    user_id: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'User ID must be a valid UUID format',
            'any.required': 'User ID is required'
        })
});

/**
 * 📝 Update Product Validation Schema
 * 
 * Same as create, but all fields are optional since PATCH/PUT
 * may only update specific fields.
 */
const updateProductSchema = Joi.object({
    user_id: Joi.string()
        .uuid()
        .optional()
        .messages({
            'string.guid': 'User ID must be a valid UUID'
        }),

    name: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Product name must be at least 2 characters',
            'string.max': 'Product name cannot exceed 100 characters'
        }),

    sku: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[A-Za-z0-9-]+$/)
        .optional()
        .messages({
            'string.min': 'SKU must be at least 3 characters',
            'string.max': 'SKU cannot exceed 50 characters',
            'string.pattern.base': 'SKU can only contain letters, numbers, and dashes'
        }),

    category: Joi.string()
        .max(50)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Category cannot exceed 50 characters'
        }),

    buy_price: Joi.number()
        .positive()
        .max(1000000)
        .optional()
        .messages({
            'number.positive': 'Buy price must be greater than 0',
            'number.max': 'Buy price cannot exceed 1,000,000'
        }),

    sale_price: Joi.number()
        .positive()
        .max(1000000)
        .optional()
        .messages({
            'number.positive': 'Sale price must be greater than 0',
            'number.max': 'Sale price cannot exceed 1,000,000'
        }),

    stock_quantity: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            'number.integer': 'Stock quantity must be a whole number',
            'number.min': 'Stock quantity cannot be negative'
        }),

    low_stock_threshold: Joi.number()
        .integer()
        .min(0)
        .optional()
        .allow(null)
        .messages({
            'number.integer': 'Low stock threshold must be a whole number',
            'number.min': 'Low stock threshold cannot be negative'
        }),

    created_at: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.format': 'Created at must be a valid ISO date string'
        })
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    userIdSchema
};

