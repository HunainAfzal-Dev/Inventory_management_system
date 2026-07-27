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
    │   ├── auth.middleware.js            # 🔐 JWT verification
    │   ├── errorHandler.js              # ⚠️ Global error handler
    │   └── validate.middleware.js        # ✅ Joi validation runner
    │
    ├── 📁 validators/
    │   ├── auth.validator.js            # 📝 Signup & login Joi schemas
    │   └── products.validator.js        # 📝 Product CRUD Joi schemas
    │
    ├── 📁 routes/
    │   ├── index.js                     # 🚦 Route aggregator (mounts all)
    │   ├── auth.routes.js               # 🔐 /api/auth/* endpoints
    │   └── products.routes.js           # 📦 /api/products/* endpoints
    │
    ├── 📁 controllers/
    │   ├── auth.controller.js           # 🔐 Auth request/response handlers
    │   └── products.controller.js       # 📦 Products request/response handlers
    │
    ├── 📁 services/
    │   ├── auth.service.js              # 🔑 Auth business logic + JWT
    │   └── products.service.js          # 📦 Products business logic
    │
    └── 📁 utils/
        ├── AppError.js                  # ⚡ Custom error class
        └── catchAsync.js                # 🔄 Async error wrapper
```

---

## 🔄 Layer Architecture & Request Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        🚀 server.js                                 │
│  Entry Point: Loads .env, imports app.js, starts HTTP listener      │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        🏗️ app.js                                   │
│  Express Setup: Registers middleware in ORDER:                      │
│  1. cors()                                                          │
│  2. express.json()                                                  │
│  3. GET /api/health (health check)                                  │
│  4. /api routes → routes/index.js                                   │
│  5. 404 handler (catch-all)                                         │
│  6. errorHandler (global error handler)                             │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        🚦 routes/index.js                           │
│  Route Aggregator: Mounts all route modules under /api              │
│  ├── /api/auth      → auth.routes.js                                │
│  └── /api/products  → products.routes.js                            │
└──────┬────────────────────────────────────┬─────────────────────────┘
       │                                    │
       ▼                                    ▼
┌──────────────────────┐     ┌──────────────────────────────────────────┐
│  🔐 AUTH ROUTES      │     │  📦 PRODUCT ROUTES                       │
│  auth.routes.js      │     │  products.routes.js                      │
│                      │     │                                          │
│  POST /signup        │     │  🔐 ALL routes require authMiddleware   │
│  POST /login         │     │  (JWT token verification)                │
│                      │     │                                          │
│  Middleware chain:   │     │  POST   /   → createProduct              │
│  validate(schema)    │     │  GET    /   → getAllProducts             │
│  → controller        │     │  GET    /:id → getProductById           │
└──────┬───────────────┘     │  PUT    /:id → updateProduct            │
       │                     │  DELETE /:id → deleteProduct             │
       ▼                     └──────┬───────────────────────────────────┘
┌──────────────────────┐            │
│  ✅ validate.middleware           │
│  1. Joi schema validates input    │
│  2. Invalid → 400 AppError        │
│  3. Valid → sanitized data→next() │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  🎮 CONTROLLER LAYER (Request/Response Handlers)                    │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ auth.controller.js   │  │ products.controller.js               │  │
│  │ Extracts req.body    │  │ Extracts req.params / req.body       │  │
│  │ → calls authService  │  │ → calls productsService              │  │
│  │ → sends JSON res     │  │ → sends JSON res                     │  │
│  │ (All wrapped in      │  │ (All wrapped in                      │  │
│  │  catchAsync wrapper) │  │  catchAsync wrapper)                 │  │
│  └────────┬─────────────┘  └──────────┬───────────────────────────┘  │
└───────────┼───────────────────────────┼──────────────────────────────┘
            │                           │
            ▼                           ▼
┌──────────────────────┐  ┌──────────────────────────────────────────────┐
│  🧠 SERVICE LAYER    │  │  🧠 SERVICE LAYER                           │
│  (Business Logic)    │  │  (Business Logic)                           │
│                      │  │                                              │
│  auth.service.js     │  │  products.service.js                        │
│                      │  │                                              │
│  SIGNUP:             │  │  CREATE: check name/SKU uniqueness          │
│  1. Check email dup  │  │  → supabase.from('products').insert         │
│  2. bcrypt hash pw   │  │                                              │
│  3. Insert user      │  │  READ: supabase.from('products').select     │
│  4. Generate JWT     │  │                                              │
│  5. Return {u,token} │  │  UPDATE: check exists → check changes       │
│                      │  │  → supabase.from('products').update         │
│  LOGIN:              │  │                                              │
│  1. Find user by email│  │  DELETE: check exists                       │
│  2. bcrypt compare   │  │  → supabase.from('products').delete         │
│  3. Generate JWT     │  │                                              │
│  4. Return {u,token} │  │                                              │
└────────┬─────────────┘  └──────────────────┬───────────────────────────┘
         │                                    │
         └────────────┬───────────────────────┘
                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│  🗄️ DATA ACCESS LAYER                                                │
│                                                                      │
│  config/supabase.js                                                  │
│  - Creates single Supabase client instance                            │
│  - Used by: auth.middleware.js, auth.service.js, products.service.js  │
│                                                                      │
│  Database Tables:                                                    │
│  ┌───────────┐  ┌────────────┐                                       │
│  │  users     │  │  products  │                                       │
│  │  ────────  │  │  ────────  │                                       │
│  │  id (PK)   │  │  id (PK)   │                                       │
│  │  name      │  │  user_id   │                                       │
│  │  email     │  │  name      │                                       │
│  │  password  │  │  sku       │                                       │
│  │  shop_name │  │  category  │                                       │
│  └───────────┘  │  buy_price │                                       │
│                  │  sale_price│                                       │
│                  │  stock_qty │                                       │
│                  │  threshold │                                       │
│                  │  created_at│                                       │
│                  └────────────┘                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependency Graph (npm Packages)

```
jsonwebtoken ◄── auth.middleware.js (verify token)
            ◄── auth.service.js    (sign token)

bcryptjs    ◄── auth.service.js (hash & compare passwords)

joi         ◄── auth.validator.js (signupSchema, loginSchema)
            ◄── products.validator.js (product schemas)

@supabase/supabase-js ◄── config/supabase.js (createClient)
                            │
                            ├── auth.middleware.js (check user exists)
                            ├── auth.service.js (user CRUD)
                            └── products.service.js (product CRUD)

express ◄── app.js (create app, mount middleware)
cors    ◄── app.js (CORS headers)
dotenv  ◄── server.js (load .env)
```

---

## 🗃️ Database Tables Referenced

| Table | Service | Operations |
|-------|---------|------------|
| `users` | `auth.service.js` | `select`, `insert`, `select(id)` by auth middleware |
| `products` | `products.service.js` | `select`, `insert`, `update`, `delete` |

---

## 🎯 Quick Reference: Where to Add New Features

| If you want to add... | Files to touch (in order) |
|-----------------------|--------------------------|
| **New API endpoint** | 1. Validator → 2. Service → 3. Controller → 4. Route |
| **New database table** | 1. Service (add new functions) |
| **New middleware** | 1. Create in `middleware/` → 2. Add to route chain |
| **New validation rules** | 1. Update schema in `validators/` |
| **Change error format** | 1. Update `middleware/errorHandler.js` |

---

## 🔑 JWT Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  CLIENT  │         │  SERVER  │         │ DATABASE │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  POST /api/auth/   │                    │
     │  signup {email,    │                    │
     │  password, ...}    │                    │
     │──────────────────►│                    │
     │                    │  Check email       │
     │                    │  uniqueness        │
     │                    │──────────────────►│
     │                    │◄──────────────────│
     │                    │                    │
     │                    │  bcrypt.hash(pw)   │
     │                    │  Insert user       │
     │                    │──────────────────►│
     │                    │◄──────────────────│
     │                    │                    │
     │                    │  jwt.sign({id,     │
     │                    │  email})           │
     │                    │                    │
     │  { user, token }   │                    │
     │◄──────────────────│                    │
     │                    │                    │
     │  ──── SAVE TOKEN ────                  │
     │                    │                    │
     │  GET /api/products │                    │
     │  Authorization:    │                    │
     │  Bearer <token>    │                    │
     │──────────────────►│                    │
     │                    │  jwt.verify(token) │
     │                    │  ✓ decoded payload │
     │                    │                    │
     │                    │  Check user exists │
     │                    │──────────────────►│
     │                    │◄──────────────────│
     │                    │                    │
     │                    │  req.user = user   │
     │                    │  → next()          │
     │                    │                    │
     │  { products }      │                    │
     │◄──────────────────│                    │
     │                    │                    │
```

---

> *Document generated from the actual codebase. Every import/export link is verified against the source files.*
