const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db'); // Comment removed

dotenv.config();
connectDB(); // Comment removed

const app = express();

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Task Management API is running...');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running in Codespaces on port ${PORT}`);
});