const express = require('express');
const TokenShareController = require('../controllers/tokenShareController');

const router = express.Router();

router.post('/share', async (req, res) => {
  try {
    const result = await TokenShareController.share(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;