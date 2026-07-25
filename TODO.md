# Inventory Management System - Professionalization TODO

## ✅ Phase 1: Setup & Dependencies
- [ ] Step 1: Downgrade Express v5 → v4, add jsonwebtoken + joi
- [ ] Step 2: Create `.env.example` file

## ✅ Phase 2: Utility & Config Layer
- [ ] Step 3: Create `src/utils/AppError.js` - Custom error class
- [ ] Step 4: Create `src/utils/catchAsync.js` - Async wrapper
- [ ] Step 5: Create `src/config/supabase.js` - Supabase client config

## ✅ Phase 3: Middleware Layer
- [ ] Step 6: Create `src/middleware/errorHandler.js` - Global error handler
- [ ] Step 7: Create `src/middleware/auth.middleware.js` - JWT auth middleware
- [ ] Step 8: Create `src/middleware/validate.middleware.js` - Input validation

## ✅ Phase 4: Service Layer (Business Logic)
- [ ] Step 9: Create `src/services/auth.service.js` - Auth business logic
- [ ] Step 10: Create `src/services/products.service.js` - Products business logic

## ✅ Phase 5: Validators Layer
- [ ] Step 11: Create `src/validators/auth.validator.js` - Auth validation schemas
- [ ] Step 12: Create `src/validators/products.validator.js` - Products validation schemas

## ✅ Phase 6: Controllers Layer (Request Handlers)
- [ ] Step 13: Create `src/controllers/auth.controller.js` - Auth request handlers
- [ ] Step 14: Create `src/controllers/products.controller.js` - Products request handlers

## ✅ Phase 7: Routes Layer
- [ ] Step 15: Create `src/routes/auth.routes.js` - Auth routes
- [ ] Step 16: Create `src/routes/products.routes.js` - Products routes
- [ ] Step 17: Create `src/routes/index.js` - Route aggregator

## ✅ Phase 8: App Assembly & Entry Point
- [ ] Step 18: Create `app.js` - Express app assembly
- [ ] Step 19: Update `server.js` - Entry point

## ✅ Phase 9: Testing
- [ ] Step 20: Install deps and start server to verify

