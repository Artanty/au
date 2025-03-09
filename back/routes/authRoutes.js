const express = require('express');
const AuthController = require('../controllers/authController');
const authenticate = require('../middlewares/auth.middleware')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const router = express.Router();

// Authentication Routes
router.post('/signup', async (req, res) => {
  try {
    const result = await AuthController.signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router.post('/login', async (req, res) => {
//   try {
//     const result = await AuthController.login(req.body);
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// router.post('/logout', async (req, res) => {
//   try {
//     const result = await AuthController.logout(req.body);
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.post('/refresh-token', async (req, res) => {
  try {
    const result = await AuthController.refreshToken(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


const users = [];
const JWT_SECRET = 'your-secret-key';


router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the user (in a real app, save to a database)
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  // Set the token as a cookie
  res.cookie('token', token, { 
    // httpOnly: true, // прячет куки для js
    maxAge: 3600000 
  }); // 1 hour

  res.json({ message: 'Logged in successfully' });
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the token cookie
  // res.clearCookie('token', {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'strict',
  //   path: '/', // Ensure the path matches the one used when setting the cookie
  // });
  res.json({ message: 'Logged out successfully' });
});

// Protected route
router.get('/profile', authenticate, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}` });
});

module.exports = router;