import express from 'express';
import dotenv from 'dotenv';
import authToken from './routes/authToken';
import authCookies from './routes/authCookies';
import tokenShare from './routes/tokenShare';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import checkDBConnection from './core/db_check_connection';
import userRoutes from './routes/userRoutes'; // Assuming you have this file

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
  origin: allowedOrigins, // Allow requests from these origins
  credentials: true, // Allow credentials (cookies)
};

// Routes
app.use('/auth-token', cors(), authToken);
app.use('/auth-cookies', cors(corsOptions), authCookies);
app.use('/token-share', cors(), tokenShare);
app.use('/api/users', cors(), userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  checkDBConnection();
});