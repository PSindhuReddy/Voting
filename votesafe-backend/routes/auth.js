
// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt received:', req.body);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Find user by email
        console.log('Searching for user with email:', email);
        const user = await User.findOne({ email });
        
        // If no user found with that email
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        console.log('User found, comparing passwords');
        
        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('Password validation failed');
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        console.log('Password validation successful');
        
        // Don't send the password back to the client
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        
        console.log('Login successful for user:', email);
        
        // User authenticated successfully
        res.json({ 
            message: 'Login successful',
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error('Detailed login error:', error);
        res.status(500).json({ message: 'Error during login process', error: error.message });
    }
});

// Add register route for completeness
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        // Don't send the password back to the client
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        
        res.status(201).json({
            message: 'User registered successfully',
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error during registration', error: error.message });
    }
});

module.exports = router;