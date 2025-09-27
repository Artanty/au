import express from 'express';
import { AuthController } from '../controllers/authController';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ensureErr } from '../utils/throwError';
import { UserController } from '../controllers/userController';

dotenv.config();
const router = express.Router();

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.post('/logout', AuthController.logout);

router.post('/check-token', AuthController.checkToken);



router.post('/profile', UserController.getProfile);

export default router;