import express from 'express';
import { AuthController } from '../controllers/authController';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ensureErr } from '../utils/throwError';
import { UserController } from '../controllers/userController';

dotenv.config();
const router = express.Router();

router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.post('/profile', UserController.getProfile);

/**
 * todo - think what is it - logout when:
 * - access token is not in db, its on disc + shared
 * - refresh token is not in db, its on disc + shared
 * */
router.post('/logout', UserController.logout);

// todo - think how to - look prev.
router.post('/refresh-token', async (req, res) => {
  try {
    const result = await AuthController.refreshToken(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: ensureErr(error) });
  }
});

export default router;