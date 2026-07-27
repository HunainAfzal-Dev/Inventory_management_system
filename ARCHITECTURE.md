# 🏗️ Inventory Management System - Architecture Document

> **Purpose**: This document provides a complete visual map of the project structure, showing how every file connects, imports, and exports. Use it to onboard new developers, debug dependency issues, or understand the request flow.

---

## 📂 Complete File Tree

```
backend/
│
├── 📄 server.js                          # 🚀 ENTRY POINT - Starts the HTTP server
├── 📄 app.js                             # 🏗️ APP ASSEMBLY - Configures Express
├── 📄 .env.example                       # 🔐 Environment variable template
├── 📄 .gitignore                         # 🙈 Git exclusion rules
├── 📄 package.json                       # 📦 Dependencies & scripts
│
└── 📁 src/
    │
    ├── 📁 config/
    │   └── supabase.js                   # 🗄️ Database client
    │
    ├── 📁 middleware/
    │   ├── auth.middleware.js             # 🔐 JWT verification
    │   ├── errorHandler.js               # ⚠️ Global error handler
    │   └── validate.middleware.js         # ✅ Joi validation runner
    │
    ├── 📁 validators/
    │   ├── auth.validator.js             # 📝 Signup & login Joi schemas
    │   └── products.validator.js         # 📝 Product CRUD Joi schemas
    │
    ├── 📁 routes/
    │   ├── index.js                      # 🚦 Route aggregator (mounts all)
    │   ├── auth.routes.js                # 🔐 /api/auth/* endpoints
    │   └── products.routes.js            # 📦 /api/products/* endpoints
    │
    ├── 📁 controllers/
    │   ├── auth.controller.js            # 🔐 Auth request/response handlers
    │   └── products.controller.js        # 📦 Products request/response handlers
    │
    ├── 📁 services/
    │   ├── auth.service.js               # 🔑 Auth business logic + JWT
    │   └── products.service.js           # 📦 Products business logic
    │
    └── 📁 utils/
        ├── AppError.js                   # ⚡ Custom error class
        └── catchAsync.js                 # 🔄 Async error wrapper
```

---

## 🔄 Import/Export Dependency Graph

Below is every file with its **imports** (what it depends on) and **exports** (what it provides).

---

### 🚀 Entry Layer

#### `server.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
require('dotenv').config();       // 📦 npm: Loads .env into process.env
const app = require('./app');     // 📁 Local: Import configured Express app

// ── EXPORTS ──────────────────────────────────────────────
module.exports = server;          // Export server instance (for testing)
```

**What it does**: Loads environment variables, starts the HTTP server, handles process-level errors (uncaught exceptions, unhandled rejections).

---

### 🏗️ App Assembly Layer

#### `app.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const express = require('express');           // 📦 npm: Web framework
const cors = require('cors');                 // 📦 npm: CORS headers
const errorHandler = require('./src/middleware/errorHandler');  // 📁 Local
const apiRoutes = require('./src/routes/index');               // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = app;               // Export configured Express app
```

---

### 🗄️ Config Layer

#### `src/config/supabase.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const { createClient } = require('@supabase/supabase-js');  // 📦 npm
const AppError = require('../utils/AppError');               // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = supabase;          // Export configured Supabase client

// ── USED BY ──────────────────────────────────────────────
// → src/middleware/auth.middleware.js  (checks user exists)
// → src/services/auth.service.js       (creates/fetches users)
// → src/services/products.service.js   (product CRUD operations)
```

---

### ⚡ Utility Layer

#### `src/utils/AppError.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
// (none - extends native Error class)

// ── EXPORTS ──────────────────────────────────────────────
module.exports = AppError;          // Custom error with statusCode & isOperational

// ── USED BY ──────────────────────────────────────────────
// → src/config/supabase.js                    (throws on missing env vars)
// → src/middleware/auth.middleware.js         (401 on invalid token)
// → src/middleware/validate.middleware.js     (400 on validation failure)
// → src/middleware/errorHandler.js            (checks isOperational flag)
// → src/services/auth.service.js             (throws on auth failures)
// → src/services/products.service.js         (throws on product failures)
```

#### `src/utils/catchAsync.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
// (none - pure utility function)

// ── EXPORTS ──────────────────────────────────────────────
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// ── USED BY ──────────────────────────────────────────────
// → src/controllers/auth.controller.js     (wraps signup & login)
// → src/controllers/products.controller.js (wraps all CRUD handlers)
```

---

### ⚠️ Middleware Layer

#### `src/middleware/errorHandler.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
// (none - checks error properties directly)

// ── EXPORTS ──────────────────────────────────────────────
module.exports = errorHandler;      // Express error-handling middleware

// ── USED BY ──────────────────────────────────────────────
// → app.js (mounted as LAST middleware: app.use(errorHandler))
```

#### `src/middleware/auth.middleware.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const { promisify } = require('util');         // 📦 Node.js built-in
const jwt = require('jsonwebtoken');           // 📦 npm: JWT verify
const AppError = require('../utils/AppError'); // 📁 Local
const supabase = require('../config/supabase');// 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = authMiddleware;    // Express middleware for JWT auth

// ── USED BY ──────────────────────────────────────────────
// → src/routes/products.routes.js (protects all product routes)
```

#### `src/middleware/validate.middleware.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const AppError = require('../utils/AppError'); // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = (schema, property) => middleware;

// ── USED BY ──────────────────────────────────────────────
// → src/routes/auth.routes.js         (validates body for signup/login)
// → src/routes/products.routes.js     (validates body & params for CRUD)
```

---

### 📝 Validator Layer

#### `src/validators/auth.validator.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const Joi = require('joi');                   // 📦 npm: Schema validation

// ── EXPORTS ──────────────────────────────────────────────
module.exports = { signupSchema, loginSchema };

// ── USED BY ──────────────────────────────────────────────
// → src/routes/auth.routes.js (passed to validate() middleware)
```

#### `src/validators/products.validator.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const Joi = require('joi');                   // 📦 npm: Schema validation

// ── EXPORTS ──────────────────────────────────────────────
module.exports = { createProductSchema, updateProductSchema, productIdSchema, userIdSchema };

// ── USED BY ──────────────────────────────────────────────
// → src/routes/products.routes.js (passed to validate() middleware)
```

---

### 🚦 Route Layer

#### `src/routes/index.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const express = require('express');             // 📦 npm
const authRoutes = require('./auth.routes');    // 📁 Local
const productRoutes = require('./products.routes'); // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = router;            // Router mounted at /api in app.js

// ── MOUNTS ─────────────────────────────────────────────────
// router.use('/auth', authRoutes)        → /api/auth/*
// router.use('/products', productRoutes) → /api/products/*
```

#### `src/routes/auth.routes.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const express = require('express');                 // 📦 npm
const authController = require('../controllers/auth.controller');     // 📁 Local
const { signupSchema, loginSchema } = require('../validators/auth.validator'); // 📁 Local
const validate = require('../middleware/validate.middleware');         // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = router;

// ── ENDPOINTS ─────────────────────────────────────────────
// POST /signup  → validate(signupSchema) → authController.signup
// POST /login   → validate(loginSchema)  → authController.login
```

#### `src/routes/products.routes.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const express = require('express');                 // 📦 npm
const productsController = require('../controllers/products.controller');   // 📁 Local
const { createProductSchema, updateProductSchema, productIdSchema, userIdSchema } = require('../validators/products.validator'); // 📁 Local
const validate = require('../middleware/validate.middleware');       // 📁 Local
const authMiddleware = require('../middleware/auth.middleware');     // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = router;

// ── MIDDLEWARE (applied to ALL routes below) ─────────────
router.use(authMiddleware);  // 🔐 All product routes require JWT

// ── ENDPOINTS ─────────────────────────────────────────────
// POST   /              → validate(createProductSchema) → productsController.createProduct
// GET    /              → productsController.getAllProducts
// GET    /user/:user_id → validate(userIdSchema, 'params') → productsController.getProductsByUser
// GET    /:id           → validate(productIdSchema, 'params') → productsController.getProductById
// PUT    /:id           → validate(productIdSchema) → validate(updateProductSchema) → productsController.updateProduct
// DELETE /:id           → validate(productIdSchema) → productsController.deleteProduct
```

---

### 🎮 Controller Layer

#### `src/controllers/auth.controller.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const catchAsync = require('../utils/catchAsync');           // 📁 Local
const authService = require('../services/auth.service');     // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = { signup, login };

// ── RESPONSIBILITY ───────────────────────────────────────
// Extracts data from req → calls authService → sends response
```

#### `src/controllers/products.controller.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const catchAsync = require('../utils/catchAsync');               // 📁 Local
const productsService = require('../services/products.service'); // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = { createProduct, getAllProducts, getProductById, getProductsByUser, updateProduct, deleteProduct };

// ── RESPONSIBILITY ───────────────────────────────────────
// Extracts data from req.params/req.body → calls productsService → sends response
```

---

### 🧠 Service Layer (Business Logic)

#### `src/services/auth.service.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const bcrypt = require('bcryptjs');                 // 📦 npm: Password hashing
const jwt = require('jsonwebtoken');                // 📦 npm: JWT signing
const supabase = require('../config/supabase');     // 📁 Local
const AppError = require('../utils/AppError');      // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = { signup, login, generateToken };

// ── DATABASE TABLES USED ─────────────────────────────────
// supabase.from('users').select/insert...
```

#### `src/services/products.service.js`
```javascript
// ── IMPORTS ──────────────────────────────────────────────
const supabase = require('../config/supabase');     // 📁 Local
const AppError = require('../utils/AppError');      // 📁 Local

// ── EXPORTS ──────────────────────────────────────────────
module.exports = { createProduct, getAllProducts, getProductById, getProductsByUser, updateProduct, deleteProduct };

// ── DATABASE TABLES USED ─────────────────────────────────
// supabase.from('products').select/insert/update/delete...
```

---

## 🔀 Complete Request Flow Diagram

```
📥 HTTP REQUEST
      │
      ▼
┌──────────────────────────────────────────────────────────┐
│  server.js                                               │
│  - Loads .env                                            │
│  - Imports app.js                                        │
│  - Starts listening on PORT                              │
│  - Catches uncaught exceptions & rejections              │
└──────────────────────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────────────────────┐
│  app.js                                                  │
│  - Registers middleware in ORDER:                        │
│    1. cors()                                             │
│    2. express.json()                                     │
│    3. GET /api/health (inline route)                     │
│    4. /api routes → src/routes/index.js                  │
│    5. 404 handler (catch-all)                            │
│    6. errorHandler (global)                              │
└──────────────────────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────────────────────┐
│  src/routes/index.js                                     │
│  - Mounts:                                               │
│    /auth    → auth.routes.js                             │
│    /products → products.routes.js                        │
└──────────────────────────────────────────────────────────┘
      │
      ├─────────── AUTH ROUTE ───────────────────────────────
      │           │
      │           ▼
      │  ┌─────────────────────────────────────────────────┐
      │  │  auth.routes.js                                 │
      │  │  Middleware chain:                               │
      │  │  POST /signup → validate(signupSchema) → authController.signup │
      │  │  POST /login  → validate(loginSchema)  → authController.login  │
      │  └─────────────────────────────────────────────────┘
      │           │
      │           ▼
      │  ┌─────────────────────────────────────────────────┐
      │  │  validate.middleware.js                         │
      │  │  1. Takes Joi schema + req.body                 │
      │  │  2. Validates input                             │
      │  │  3. Invalid → 400 AppError                      │
      │  │  4. Valid → req.body = sanitized data → next()  │
      │  └─────────────────────────────────────────────────┘
      │           │
      │           ▼
      │  ┌─────────────────────────────────────────────────┐
      │  │  auth.controller.js                             │
      │  │  (wrapped in catchAsync)                        │
      │  │  1. Extracts data from req.body                 │
      │  │  2. Calls authService.signup() or .login()      │
      │  │  3. Returns { status, message, data: { user, token } } │
      │  └─────────────────────────────────────────────────┘
      │           │
      │           ▼
      │  ┌─────────────────────────────────────────────────┐
      │  │  auth.service.js                                │
      │  │  SIGNUP:                                        │
      │  │  1. Check email uniqueness → supabase           │
      │  │  2. Hash password → bcrypt.genSalt + bcrypt.hash│
      │  │  3. Insert user → supabase.from('users').insert │
      │  │  4. Generate JWT → jwt.sign({ id, email })      │
      │  │  5. Return { user, token }                      │
      │  │                                                 │
      │  │  LOGIN:                                         │
      │  │  1. Find user → supabase.from('users').select   │
      │  │  2. Compare password → bcrypt.compare           │
      │  │  3. Generate JWT → jwt.sign({ id, email })      │
      │  │  4. Return { user, token }                      │
      │  └─────────────────────────────────────────────────┘
      │
      └─────────── PRODUCT ROUTE ────────────────────────────
                      │
                      ▼
              ┌─────────────────────────────────────────────────┐
              │  products.routes.js                             │
              │  🔐 ALL routes require authMiddleware FIRST     │
              │                                                  │
              │  Middleware chain:                               │
              │  POST   /  → auth → validate → createProduct    │
              │  GET    /  → auth → getAllProducts               │
              │  GET    /:id → auth → validate(id) → getProductById │
              │  PUT    /:id → auth → validate(id,body) → updateProduct │
              │  DELETE /:id → auth → validate(id) → deleteProduct │
              └─────────────────────────────────────────────────┘
                      │
                      ▼
              ┌─────────────────────────────────────────────────┐
              │  auth.middleware.js                             │
              │  1. Extract token from Authorization: Bearer   │
              │  2. Verify token → jwt.verify(token, JWT_SECRET)│
              │  3. Check user exists → supabase.from('users')  │
              │  4. Attach to req.user → req.user = user       │
              │  5. Invalid/expired → 401 AppError             │
              └─────────────────────────────────────────────────┘
                      │
                      ▼
              ┌─────────────────────────────────────────────────┐
              │  validate.middleware.js (same as auth path)     │
              └─────────────────────────────────────────────────┘
                      │
                      ▼
              ┌─────────────────────────────────────────────────┐
              │  products.controller.js (wrapped in catchAsync) │
              │  1. Extracts data from req.body / req.params    │
              │  2. Calls appropriate productsService function  │
              │  3. Returns { status, data: { product } }       │
              └─────────────────────────────────────────────────┘
                      │
                      ▼
              ┌─────────────────────────────────────────────────┐
              │  products.service.js                            │
              │  CREATE: check name uniqueness → check SKU      │
              │          → supabase.from('products').insert     │
              │  READ:   supabase.from('products').select       │
              │  UPDATE: check exists → check name/sku changes  │
              │          → supabase.from('products').update     │
              │  DELETE: check exists → supabase.from('products').delete │
              └─────────────────────────────────────────────────┘

📤 HTTP RESPONSE ←── errorHandler (if AppError thrown anywhere)
```

---

## 🗃️ Database Tables Referenced

| Table | Service | Operations |
|-------|---------|------------|
| `users` | `auth.service.js` | `select`, `insert`, `select(id)` by auth middleware |
| `products` | `products.service.js` | `select`, `insert`, `update`, `delete` |

---

## 📦 Dependency Graph (npm Packages)

```
jsonwebtoken ◄── auth.middleware.js (verify token)
            ◄── auth.service.js    (sign token)
                    │
bcryptjs ◄──────── auth.service.js (hash & compare passwords)
                    │
joi ◄────────────── auth.validator.js (signupSchema, loginSchema)
                ◄── products.validator.js (product schemas)
                    │
@supabase/supabase-js ◄── config/supabase.js (createClient)
                            │
                            ├── auth.middleware.js (check user exists)
                            ├── auth.service.js (user CRUD)
                            └── products.service.js (product CRUD)
                    │
express ◄────────── app.js (create app, mount middleware)
cors ◄──────────── app.js (CORS headers)
dotenv ◄────────── server.js (load .env)
```

---

## 🎯 Quick Reference: Where to Add New Features

| If you want to add... | You need to touch... |
|-----------------------|---------------------|
| **New API endpoint** | 1. Validator (optional) → 2. Service → 3. Controller → 4. Route |
| **New database table** | 1. Service (add new functions) |
| **New middleware** | 1. Create in `middleware/` → 2. Add to route chain |
| **New validation rules** | 1. Update schema in `validators/` |
| **Change error format** | 1. Update `middleware/errorHandler.js` |

---

> *Document generated from the actual codebase. Every import/export link is verified against the source files.*

