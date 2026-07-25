/**
 * 🔐 Auth Controller
 * 
 * CONTROLLERS vs SERVICES:
 * ========================
 * Controllers handle HTTP request/response concerns:
 * - Extract data from req (body, params, query, user)
 * - Call appropriate service function(s)
 * - Send HTTP response with status code + data
 * 
 * Services handle business logic & database:
 * - Validate business rules (e.g., "email already exists")
 * - Interact with Supabase
 * - Throw errors (which our error handler catches)
 * 
 * This separation means controllers are THIN (just request/response glue)
 * and services are THICK (all the important logic lives here).
 * 
 * 🧠 All controller functions use catchAsync to avoid try/catch boilerplate.
 * 
 * @module authController
 */

const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');

/**
 * 📝 POST /api/auth/signup - Register a new user
 * 
 * After validation (by validate middleware) and execution (by this controller):
 * 1. Service creates the user in the database
 * 2. Service generates a JWT token
 * 3. We send back user data + token (client stores this for auth)
 * 
 * 🔄 The client will send this token in the Authorization header
 *    for all subsequent authenticated requests.
 */
const signup = catchAsync(async (req, res, next) => {
    // Extract validated data from request body
    // (The validate middleware has already cleaned this data)
    const { name, email, password, shop_name } = req.body;

    // Call the auth service to handle registration logic
    const { user, token } = await authService.signup({
        name,
        email,
        password,
        shop_name
    });

    // Send 201 Created with user data and JWT token
    res.status(201).json({
        status: 'Success',
        message: 'User registered successfully! 🎉',
        data: {
            user,
            token // 🔑 Client must store this for future requests
        }
    });
});

/**
 * 🔓 POST /api/auth/login - Authenticate an existing user
 * 
 * 1. Service verifies email + password
 * 2. Service generates a JWT token
 * 3. We send back user data + token
 */
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Call the auth service to verify credentials
    const { user, token } = await authService.login(email, password);

    // Send 200 OK with user data and JWT token
    res.status(200).json({
        status: 'Success',
        message: 'Login successful! 🎉',
        data: {
            user,
            token // 🔑 Client stores this for authenticated requests
        }
    });
});

module.exports = {
    signup,
    login
};

