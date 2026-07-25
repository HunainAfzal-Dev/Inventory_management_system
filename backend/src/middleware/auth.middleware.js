/**
 * 🔐 JWT Authentication Middleware
 * 
 * WHAT IS JWT?
 * ============
 * JWT (JSON Web Token) is an open standard (RFC 7519) that defines a compact
 * and self-contained way to securely transmit information between parties as
 * a JSON object. In our app, JWT is used for AUTHENTICATION:
 * 
 * 1️⃣ User logs in with email & password
 * 2️⃣ Server verifies credentials, creates a JWT containing user's id & email
 * 3️⃣ Server signs the JWT with a secret key (JWT_SECRET)
 * 4️⃣ Server sends the JWT back to the client
 * 5️⃣ Client stores the JWT (usually in localStorage or httpOnly cookie)
 * 6️⃣ On subsequent requests, client sends JWT in the Authorization header
 * 7️⃣ This middleware verifies the JWT → if valid, request proceeds; if not, 401
 * 
 * 🏗️ JWT Structure:
 *   header.payload.signature
 *   - header: algorithm & token type
 *   - payload: data (user id, email, expiry)
 *   - signature: prevents tampering (created using JWT_SECRET)
 * 
 * 🔧 How this middleware works:
 * 1. Checks Authorization header for "Bearer <token>"
 * 2. If no token → 401 Unauthorized
 * 3. If token exists, verifies it using jsonwebtoken library + JWT_SECRET
 * 4. If verification fails (expired, invalid signature) → 401
 * 5. If verification succeeds, attaches decoded payload to req.user
 * 6. Calls next() → the protected route handler executes
 * 
 * 🎯 Usage:
 *   router.get('/products', authMiddleware, productsController.getAll);
 *   // ✅ Only authenticated users can access this route
 */

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
    try {
        // ===== 1️⃣ Extract token from Authorization header =====
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token is present, user is not authenticated
        if (!token) {
            return next(
                new AppError(
                    '❌ You are not logged in! Please log in to access this resource.',
                    401
                )
            );
        }

        // ===== 2️⃣ Verify the token =====
        // jsonwebtoken's verify() is callback-based, so we promisify it
        // jwt.verify(token, secret) returns the decoded payload if valid
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );

        // decoded = { id: 'user-uuid', email: 'user@example.com', iat: ..., exp: ... }
        // ✅ Token is valid! The user is authenticated.

        // ===== 3️⃣ OPTIONAL: Check if user still exists in database =====
        // A user might have been deleted after their token was issued
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, shop_name')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            return next(
                new AppError(
                    '❌ The user belonging to this token no longer exists.',
                    401
                )
            );
        }

        // ===== 4️⃣ Attach user to request object =====
        // Now req.user is available in all subsequent middleware & controllers
        // Controllers can use req.user.id, req.user.email, etc.
        req.user = user;

        // ===== 5️⃣ Proceed to the next middleware/controller =====
        next();
    } catch (err) {
        // If JWT verification fails for any reason (expired, tampered, etc.)
        return next(
            new AppError('❌ Invalid or expired token. Please log in again.', 401)
        );
    }
};

module.exports = authMiddleware;

