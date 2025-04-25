const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/election');
const voteRoutes = require('./routes/votes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
