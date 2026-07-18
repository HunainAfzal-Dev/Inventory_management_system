// import Express library for building the HTTP server
const express = require('express');
// import CORS middleware so the frontend can call this backend safely
const cors = require('cors');
// import bcrypt library for hashing passwords securely
const bcrypt = require('bcryptjs');

// load environment variables from .env file into process.env
require('dotenv').config();
// import the Supabase client that connects to our database
const supabase = require('./supabaseClient');

// create the Express application instance
const app = express();
// choose the port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// apply middleware to the Express app
// allow cross-origin requests from the frontend
app.use(cors());
// parse incoming JSON request bodies so req.body is available
app.use(express.json());

// --- TESTING ROUTE ---
// GET / -> health check route for the backend and database connectivity
app.get('/', async (req, res) => {
    try {
        // query the users table to verify Supabase is reachable
        const { data, error } = await supabase.from('users').select('*').limit(1);

        // if Supabase returns an error, throw it to use the catch block
        if (error) throw error;

        // send a success JSON response when the database is connected
        res.json({
            status: "Success",
            message: "Backend Server aur Supabase Database successfully connect ho chuke hain! 🎉"
        });
    } catch (err) {
        // handle failure during database connectivity check
        res.status(500).json({
            status: "Error",
            message: "Database se connect nahi ho saka.",
            error: err.message
        });
    }
});

// POST /api/auth/signup -> user signup route
app.post('/api/auth/signup', async (req, res) => {
    try {
        // get the user fields sent from the frontend
        const { name, email, password, shop_name } = req.body;

        // validate required fields are present
        if (!name || !email || !password || !shop_name) {
            return res.status(400).json({
                status: "Error",
                message: "Name, email, password, and shop_name are required."
            });
        }

        // check if a user with this email already exists in the database
        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        // if the query returned a user, reject the signup
        if (existingUser) {
            return res.status(400).json({
                status: "Error",
                message: "User with this email already exists."
            });
        }

        // create a salt and hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // insert the new user into the users table
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    name: name,
                    email: email,
                    password_hash: hashedPassword,
                    shop_name: shop_name
                }
            ])
            .select('id', 'name', 'email', 'shop_name', 'created_at');

        // if the insertion failed, throw the error to send a 500 response
        if (insertError) throw insertError;

        // respond with the created user data (excluding the password)
        res.status(201).json({
            status: "Success",
            message: "User registered successfully!",
            user: newUser[0]
        });

    } catch (err) {
        // log the signup error and send a generic server error response
        console.error("❌ Error during signup:", err);
        res.status(500).json({
            status: "Error",
            message: "Server error during signup.",
            error: err.message
        });
    }
});


app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "Error",
                message: "Email and password are required."
            });
        }
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single(); // fetch the user by email

        if (fetchError || !user) {
            return res.status(400).json({
                status: "Error",
                message: "Invalid email or password."
            });
        }

        res.status(200).json({
            status: "Success",
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                shop_name: user.shop_name,
            }
        })
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: "Server error: Login nahi ho saka." });
    }
})


// start listening for incoming HTTP requests on the selected port
app.listen(PORT, () => {
    console.log(`🚀 Server perfectly running on port ${PORT}`);
});