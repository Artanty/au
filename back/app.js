const express = require('express');

const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const axios = require('axios');
const cors = require('cors');

const checkDBConnection = require('./core/db_check_connection')
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://localhost:4204', // Allow requests from this origin
  credentials: true, // Allow credentials (cookies)
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); 

// Routes
app.use('/auth', authRoutes);



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  checkDBConnection()
  // test()
});