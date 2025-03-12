const express = require('express');
const AuthController = require('../controllers/authController');
const dotenv = require('dotenv');
const router = express.Router();
const jwt = require('jsonwebtoken');
dotenv.config();

router.post('/signup', async (req, res) => {
  try {
    const result = await AuthController.signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await AuthController.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }
  try {
    const result = await AuthController.logout(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const result = await AuthController.refreshToken(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({ message: 'Access granted', user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});


module.exports = router;