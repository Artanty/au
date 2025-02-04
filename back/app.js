const express = require('express');

const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');


const axios = require('axios');
const cors = require('cors');
const checkDBConnection = require('./core/db_check_connection')
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  checkDBConnection()
  // test()
});