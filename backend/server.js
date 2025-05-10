const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const PORT = 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/graph', require('./routes/graph'));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

