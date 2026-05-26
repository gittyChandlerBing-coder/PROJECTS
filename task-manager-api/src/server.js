const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in the body

// Basic test route
app.get('/', (req, res) => {
    res.send('Task Management API is running...');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running in Codespaces on port ${PORT}`);
});