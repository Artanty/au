import express from 'express';
import { UserController } from '../controllers/userController';
import { validateApiKey } from '../middlewares/validateApiKey';
import { AuthController } from '../controllers/authController';

const router = express.Router();

/**
 * /api/users
 * */
router.post('/encrypt', validateApiKey, AuthController.encrypt);

router.post('/decrypt', validateApiKey, AuthController.decrypt);

export default router;
