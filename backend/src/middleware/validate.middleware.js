/**
 * ✅ Request Validation Middleware
 * 
 * WHY VALIDATION?
 * ===============
 * Before storing data in the database, we MUST validate that it matches
 * our expected format. This prevents:
 * - Malformed data from entering the database
 * - Security vulnerabilities (SQL injection, XSS via input)
 * - Confusing errors for frontend users
 * 
 * Instead of writing manual if/else checks in every controller (messy!),
 * we use Joi schemas that declaratively describe valid data shapes.
 * This middleware runs the schema against the request and returns
 * a clean 400 error if validation fails.
 * 
 * 🧠 How this middleware works:
 * 1. It's a function that accepts a Joi schema and a property name
 * 2. It returns Express middleware that:
 *    a. Takes the specified request property (body, params, query)
 *    b. Validates it against the Joi schema
 *    c. If valid → replaces req property with validated data & calls next()
 *    d. If invalid → sends 400 response with detailed error message
 * 
 * 🎯 Usage:
 *   // Validate request body against signupSchema
 *   router.post('/signup', validate(signupSchema, 'body'), controller.signup);
 * 
 *   // Validate request params against idSchema
 *   router.get('/:id', validate(idSchema, 'params'), controller.getProduct);
 * 
 * @param {Object} schema - A Joi schema object defining valid data shape
 * @param {string} property - Which req property to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */

const AppError = require('../utils/AppError');

module.exports = (schema, property = 'body') => {
    // Return the actual middleware function
    return (req, res, next) => {
        // Validate the specified request property against the Joi schema
        // { abortEarly: false } collects ALL validation errors, not just the first one
        const { error, value } = schema.validate(req[property], {
            abortEarly: false
        });

        // If validation failed, format and send the error response
        if (error) {
            // Map each Joi error detail to a readable message
            // Joi gives us: error.details = [{ message: '"name" is required', path: ['name'] }, ...]
            const errorMessages = error.details.map((detail) => detail.message);

            // Send 400 Bad Request with all validation error messages
            return next(
                new AppError(
                    `Validation failed: ${errorMessages.join('; ')}`,
                    400
                )
            );
        }

        // ✅ Validation passed!
        // Replace the request property with the validated (and possibly transformed) data
        // This is important because Joi can transform data (e.g., trim strings, convert types)
        req[property] = value;

        // Proceed to the next middleware/controller
        next();
    };
};

