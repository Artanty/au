const express = require('express');

const dotenv = require('dotenv');
const authToken = require('./routes/authToken');
const authCookies = require('./routes/authCookies');
const tokenShare = require('./routes/tokenShare');


const cookieParser = require('cookie-parser');
const cors = require('cors');

const checkDBConnection = require('./core/db_check_connection')
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(express.json());
app.use(cookieParser()); 

// authCookies middleware
const allowedOrigins = [
  /^https?:\/\/localhost:4204$/,
  /^https?:\/\/localhost:4222$/,
  'http://localhost:4204',
  'http://localhost:4222'
];

const corsOptions = {
  origin: allowedOrigins, // Allow requests from this origin
  credentials: true, // Allow credentials (cookies)
};

// Routes
app.use('/auth-token', cors(), authToken);
app.use('/auth-cookies', cors(corsOptions), authCookies);
app.use('/token-share', cors(), tokenShare);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  checkDBConnection()
  // test()
});