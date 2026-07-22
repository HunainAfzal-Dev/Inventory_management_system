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
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(400).json({
                status: "Error",
                message: "Invalid password."
            })
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


// ========== PRODUCTS CRUD APIs ==========

// --- CREATE PRODUCT ---
app.post('/api/products', async (req, res) => {
    try {
        const { user_id, name, sku, category, buy_price, sale_price, stock_quantity, low_stock_threshold, created_at } = req.body;

        // check for missing required fields and collect their names
        const requiredFields = { user_id, name, sku, buy_price, sale_price, stock_quantity };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === '')
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: "Error",
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // validate numeric fields are positive numbers
        if (Number(buy_price) <= 0) {
            return res.status(400).json({ status: "Error", error: "buy_price must be greater than 0." });
        }
        if (Number(sale_price) <= 0) {
            return res.status(400).json({ status: "Error", error: "sale_price must be greater than 0." });
        }
        if (Number(stock_quantity) < 0) {
            return res.status(400).json({ status: "Error", error: "stock_quantity cannot be negative." });
        }

        // check duplicate product name for the same user
        const { data: existingNames, error: nameCheckError } = await supabase
            .from('products')
            .select('id')
            .eq('user_id', user_id)
            .eq('name', name)
            .limit(1);

        if (nameCheckError) throw nameCheckError;
        if (existingNames && existingNames.length > 0) {
            return res.status(409).json({ status: "Error", error: `A product with the name "${name}" already exists.` });
        }

        // check duplicate SKU (globally unique)
        const { data: existingSkus, error: skuCheckError } = await supabase
            .from('products')
            .select('id')
            .eq('sku', sku)
            .limit(1);

        if (skuCheckError) throw skuCheckError;
        if (existingSkus && existingSkus.length > 0) {
            return res.status(409).json({ status: "Error", error: `SKU "${sku}" is already in use by another product.` });
        }

        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    user_id,
                    name,
                    sku,
                    category,
                    buy_price: Number(buy_price),
                    sale_price: Number(sale_price),
                    stock_quantity: Number(stock_quantity),
                    low_stock_threshold: low_stock_threshold ? Number(low_stock_threshold) : null,
                    created_at: created_at || new Date().toISOString()
                }
            ])
            .select();
        if (error) {
            console.error('Supabase Insert Error:', error.message);
            return res.status(500).json({ status: "Error", error: 'Database error while adding product.' });
        }

        res.status(201).json({ status: "Success", message: 'Product added successfully.', product: data[0] });

    } catch (err) {
        console.error('Error while adding product:', err);
        res.status(500).json({ status: "Error", error: 'Server error while adding product.' });
    }
});


// --- GET ALL PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ status: "Error", error: error.message });
        }

        res.status(200).json({
            status: "Success",
            count: products.length,
            products
        });

    } catch (err) {
        console.error("Fetch All Products Error:", err.message);
        res.status(500).json({ status: "Error", error: "Server error while fetching products." });
    }
});


// --- GET PRODUCT BY ID ---
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ status: "Error", error: `Product with id ${id} not found.` });
            }
            return res.status(400).json({ status: "Error", error: error.message });
        }

        res.status(200).json({
            status: "Success",
            product
        });

    } catch (err) {
        console.error("Fetch Product By ID Error:", err.message);
        res.status(500).json({ status: "Error", error: "Server error while fetching product." });
    }
});


// --- GET PRODUCTS BY USER ID ---
app.get('/api/products/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ status: "Error", error: error.message });
        }

        res.status(200).json({
            status: "Success",
            count: products.length,
            products
        });

    } catch (err) {
        console.error("Fetch Products By User Error:", err.message);
        res.status(500).json({ status: "Error", error: "Server error while fetching products." });
    }
});


// --- UPDATE PRODUCT ---
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, name, sku, category, buy_price, sale_price, stock_quantity, low_stock_threshold, created_at } = req.body;

        // check if product exists
        const { data: existingProduct, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingProduct) {
            return res.status(404).json({ status: "Error", error: `Product with id ${id} not found.` });
        }

        // if updating name, check for duplicate name (exclude current product)
        if (name && name !== existingProduct.name) {
            const { data: duplicateNames } = await supabase
                .from('products')
                .select('id')
                .eq('user_id', user_id || existingProduct.user_id)
                .eq('name', name)
                .neq('id', id)
                .limit(1);

            if (duplicateNames && duplicateNames.length > 0) {
                return res.status(409).json({ status: "Error", error: `A product with the name "${name}" already exists.` });
            }
        }

        // if updating sku, check for duplicate sku (exclude current product)
        if (sku && sku !== existingProduct.sku) {
            const { data: duplicateSkus } = await supabase
                .from('products')
                .select('id')
                .eq('sku', sku)
                .neq('id', id)
                .limit(1);

            if (duplicateSkus && duplicateSkus.length > 0) {
                return res.status(409).json({ status: "Error", error: `SKU "${sku}" is already in use by another product.` });
            }
        }

        // validate numeric fields if provided
        if (buy_price !== undefined && Number(buy_price) <= 0) {
            return res.status(400).json({ status: "Error", error: "buy_price must be greater than 0." });
        }
        if (sale_price !== undefined && Number(sale_price) <= 0) {
            return res.status(400).json({ status: "Error", error: "sale_price must be greater than 0." });
        }
        if (stock_quantity !== undefined && Number(stock_quantity) < 0) {
            return res.status(400).json({ status: "Error", error: "stock_quantity cannot be negative." });
        }

        // build update object with only provided fields
        const updateData = {};
        if (user_id !== undefined) updateData.user_id = user_id;
        if (name !== undefined) updateData.name = name;
        if (sku !== undefined) updateData.sku = sku;
        if (category !== undefined) updateData.category = category;
        if (buy_price !== undefined) updateData.buy_price = Number(buy_price);
        if (sale_price !== undefined) updateData.sale_price = Number(sale_price);
        if (stock_quantity !== undefined) updateData.stock_quantity = Number(stock_quantity);
        if (low_stock_threshold !== undefined) updateData.low_stock_threshold = low_stock_threshold ? Number(low_stock_threshold) : null;
        if (created_at !== undefined) updateData.created_at = created_at;

        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select();

        if (updateError) {
            console.error('Supabase Update Error:', updateError.message);
            return res.status(500).json({ status: "Error", error: 'Database error while updating product.' });
        }

        res.status(200).json({
            status: "Success",
            message: 'Product updated successfully.',
            product: updatedProduct[0]
        });

    } catch (err) {
        console.error('Error while updating product:', err);
        res.status(500).json({ status: "Error", error: 'Server error while updating product.' });
    }
});


// --- DELETE PRODUCT ---
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // check if product exists
        const { data: existingProduct, error: fetchError } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError || !existingProduct) {
            return res.status(404).json({ status: "Error", error: `Product with id ${id} not found.` });
        }

        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Supabase Delete Error:', deleteError.message);
            return res.status(500).json({ status: "Error", error: 'Database error while deleting product.' });
        }

        res.status(200).json({
            status: "Success",
            message: 'Product deleted successfully.',
            deleted_product_id: id
        });

    } catch (err) {
        console.error('Error while deleting product:', err);
        res.status(500).json({ status: "Error", error: 'Server error while deleting product.' });
    }
});

// start listening for incoming HTTP requests on the selected port
app.listen(PORT, () => {
    console.log(`🚀 Server perfectly running on port ${PORT}`);
});