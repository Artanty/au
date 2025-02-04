const express = require('express');
const AuthController = require('../controllers/authController');

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

router.post('/login', async (req, res) => {
  try {
    const result = await AuthController.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
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

module.exports = router;