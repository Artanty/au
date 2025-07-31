import express from 'express';
import { TokenShareController } from '../controllers/tokenShareController';
import { ensureErr } from '../utils/throwError';
import { dd } from '../utils/dd';

const router = express.Router();

router.post('/share', async (req, res) => {
  dd('im here')
  try {
    const result = await TokenShareController.share(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: ensureErr(error) });
  }
});

export default router;

