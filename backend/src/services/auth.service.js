/**
 * 🔐 Authentication Service
 * 
 * This service contains ALL business logic related to authentication:
 * - User signup (registration)
 * - User login (authentication)
 * - JWT token generation
 * 
 * WHY A SERVICE LAYER?
 * ====================
 * Separating business logic from request handling (controllers) gives us:
 * 1. REUSABILITY: Other parts of the app can call the same functions
 * 2. TESTABILITY: We can test business logic without making HTTP requests
 * 3. MAINTAINABILITY: If the database changes (e.g., SQL vs NoSQL),
 *    we only change the service, not the controllers
 * 
 * 🧠 ARCHITECTURE:
 *   Controller (handles req/res) → Service (business logic) → Database
 * 
 * @module authService
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * 🔑 Generate JWT Token
 * 
 * Creates a signed JWT token for a user. The token contains the user's
 * id and email in its payload, which the auth middleware can then decode
 * to authenticate subsequent requests.
 * 
 * @param {Object} user - User object with at least id and email
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
    // jwt.sign(payload, secret, options)
    // - payload: Data stored inside the token (visible but tamper-proof)
    // - secret: Server's private key to sign the token
    // - expiresIn: Token validity duration
    return jwt.sign(
        { id: user.id, email: user.email }, // Payload
        process.env.JWT_SECRET,              // Secret from .env
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } // Expiry
    );
};

/**
 * 📝 Register a new user
 * 
 * Steps:
 * 1. Validate that the email isn't already registered
 * 2. Hash the password using bcrypt (one-way encryption)
 * 3. Insert the new user into Supabase
 * 4. Generate a JWT token for auto-login after signup
 * 5. Return user data (excluding password) + token
 * 
 * @param {Object} userData - { name, email, password, shop_name }
 * @returns {Object} { user, token } - New user object and JWT token
 * @throws {AppError} If email already exists or database error
 */
const signup = async (userData) => {
    const { name, email, password, shop_name } = userData;

    // ===== 1️⃣ Check for existing user =====
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        throw new AppError('User with this email already exists.', 409);
    }

    // ===== 2️⃣ Hash the password =====
    // bcrypt.genSalt(10) creates a salt with 10 rounds of encryption
    // bcrypt.hash() hashes the password with the salt
    // We NEVER store plain-text passwords in the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ===== 3️⃣ Insert new user into database =====
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
            {
                name,
                email,
                password_hash: hashedPassword,
                shop_name
            }
        ])
        .select('id, name, email, shop_name, created_at');

    if (insertError) {
        console.error('Database insert error:', insertError);
        throw new AppError('Failed to create user. Please try again.', 500);
    }

    // ===== 4️⃣ Generate JWT token =====
    const token = generateToken(newUser[0]);

    // ===== 5️⃣ Return user (excluding password) + token =====
    return {
        user: newUser[0],
        token
    };
};

/**
 * 🔓 Login an existing user
 * 
 * Steps:
 * 1. Find user by email
 * 2. Compare provided password with stored hash
 * 3. If valid, generate JWT token
 * 4. Return user data + token
 * 
 * 🐛 BUG FIXED: In the original server.js, the password mismatch check
 * was missing a `return` statement. This meant even after sending a 400
 * error for wrong password, the code continued and sent a 200 success
 * response too (causing "Cannot set headers after they are sent" error).
 * 
 * @param {string} email - User's email
 * @param {string} password - User's plain-text password
 * @returns {Object} { user, token }
 * @throws {AppError} If credentials are invalid
 */
const login = async (email, password) => {
    // ===== 1️⃣ Find user by email =====
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (fetchError || !user) {
        // Don't reveal whether the email exists or password is wrong
        throw new AppError('Invalid email or password.', 401);
    }

    // ===== 2️⃣ Compare passwords =====
    // bcrypt.compare() hashes the input and compares with stored hash
    // This is why we NEVER need to decrypt the password (it's one-way)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new AppError('Invalid email or password.', 401);
    }

    // ===== 3️⃣ Generate JWT token =====
    const token = generateToken(user);

    // ===== 4️⃣ Return user (excluding password) + token =====
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            shop_name: user.shop_name
        },
        token
    };
};

// Export all service functions
module.exports = {
    signup,
    login,
    generateToken
};

