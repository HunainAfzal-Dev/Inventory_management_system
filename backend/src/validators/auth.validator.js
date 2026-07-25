/**
 * ✅ Auth Validation Schemas (Joi)
 * 
 * WHAT IS JOI?
 * ============
 * Joi is a powerful schema description language and validator for JavaScript.
 * Instead of writing tedious if/else checks like:
 *   if (!name) return res.status(400).json({ error: 'Name is required' })
 *   if (name.length < 3) return res.status(400).json(...)
 * 
 * We write a declarative schema:
 *   name: Joi.string().min(3).max(50).required()
 * 
 * Joi handles all the validation + gives clear error messages!
 * 
 * @module authValidators
 */

const Joi = require('joi');

/**
 * 📝 Signup Validation Schema
 * 
 * Validates the request body when a new user registers.
 * 
 * Rules:
 * - name:     3-50 characters, required
 * - email:    Valid email format, required
 * - password: Minimum 6 characters, required
 * - shop_name: 2-100 characters, required
 */
const signupSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be at least 3 characters long',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),

    shop_name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Shop name must be at least 2 characters long',
            'string.max': 'Shop name cannot exceed 100 characters',
            'any.required': 'Shop name is required'
        })
});

/**
 * 🔓 Login Validation Schema
 * 
 * Validates the request body when a user logs in.
 * 
 * Rules:
 * - email:    Valid email format, required
 * - password: Must not be empty, required
 */
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

module.exports = {
    signupSchema,
    loginSchema
};

