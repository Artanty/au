import express from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../utils/auth';
import { validateApiKey } from '../middlewares/validateApiKey';

const router = express.Router();
// const controller = new UserController();

// router.post('/register', controller.register);
router.post('/login', UserController.login);
// router.get('/profile', authenticate, controller.getProfile);

router.post('/encrypt', validateApiKey, UserController.encrypt);

export default router;
