/**
 * 🗄️ Supabase Client Configuration
 * 
 * This module creates and exports a single Supabase client instance
 * that can be imported by any service in the application.
 * 
 * 🧠 What changed from the old supabaseClient.js?
 * 1. Moved from root (`backend/supabaseClient.js`) → `src/config/supabase.js`
 *    (aligns with the layered architecture)
 * 2. Added explicit AppError throw instead of process.exit(1)
 *    (process.exit abruptly kills the server; throwing a proper error
 *     gives better developer feedback)
 * 3. Better documentation (JSDoc comments for IDE intellisense)
 * 
 * 🔐 Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL (from project dashboard)
 * - SUPABASE_KEY: Your Supabase anon/public API key
 */

const { createClient } = require('@supabase/supabase-js');
const AppError = require('../utils/AppError');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// ✅ Validate that both required environment variables exist
// This check happens at startup (when the module is first imported),
// preventing runtime failures due to misconfiguration
if (!supabaseUrl || !supabaseKey) {
    throw new AppError(
        'SUPABASE_URL and SUPABASE_KEY must be defined in .env file. ' +
        'Copy .env.example to .env and fill in your Supabase project credentials.',
        500
    );
}

// ✅ Create the Supabase client instance
// This client is used throughout the application to interact with
// the Supabase database (query, insert, update, delete)
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the single instance for reuse
module.exports = supabase;

