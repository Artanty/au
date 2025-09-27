import express from 'express';
import { UserController } from '../controllers/userController';
import { validateApiKey } from '../middlewares/validateApiKey';
import { AuthController } from '../controllers/authController';

const router = express.Router();

router.post('/encrypt', validateApiKey, AuthController.encrypt);

export default router;
