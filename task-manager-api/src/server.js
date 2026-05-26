const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware to parse incoming JSON data
app.use(express.json()); 

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Task Manager API is running' });
});

// We will mount our Task routes here later
// app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running in development mode on port ${PORT}`);
});