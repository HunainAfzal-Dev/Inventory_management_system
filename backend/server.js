const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

require('dotenv').config();
// Jo supabase connection file humne upar banayi thi, usko yahan import kiya
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Frontend ko backend se baat karne ki permission di
app.use(express.json()); // Server ko bataya ke data JSON format me aayega

// --- TESTING ROUTE ---
// Jab hum browser me http://localhost:5000/ kholenge to yeh check karega ke database chal raha hai ya nahi
app.get('/', async (req, res) => {
    try {
        // Supabase database se users table ka data check karne ki koshish karte hain
        const { data, error } = await supabase.from('users').select('*').limit(1);
        
        if (error) throw error;
        
        res.json({ 
            status: "Success", 
            message: "Backend Server aur Supabase Database successfully connect ho chuke hain! 🎉" 
        });
    } catch (err) {
        res.status(500).json({ 
            status: "Error", 
            message: "Database se connect nahi ho saka.", 
            error: err.message 
        });
    }
});

app.post('/api/auth/signup', async (req, res) => {

    // frontend se aane wale data ko destructure kiya
    const { name, email, password, shop_name } = req.body;
     if(!name || !email || !password || !shop_name) {
        return res.status(400).json({ 
            status: "Error", 
            message: "Named, email, and password are requried." 
        });
    }

})

// Server ko port par listen karwaya
app.listen(PORT, () => {
    console.log(`🚀 Server perfectly running on port ${PORT}`);
});