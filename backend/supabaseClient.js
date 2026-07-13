// dotenv package ko initialize kiya taake yeh .env file se keys parh sake
require('dotenv').config();

// Supabase ki library se createClient ka function nikala
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Agar keys missing hain to server chalne se pehle hi error de de
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: SUPABASE_URL ya SUPABASE_KEY .env file me missing hai!");
  process.exit(1);
}

// Supabase client banaya jo poore backend me database se baat karne ke kaam aayega
const supabase = createClient(supabaseUrl, supabaseKey);

// Isko export kar diya taake dusri files (jaise server.js) isko use kar sakein
module.exports = supabase;