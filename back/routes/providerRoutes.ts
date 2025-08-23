import express from 'express';
import { ProviderController } from '../controllers/providerController';


const router = express.Router();


router.post('/getProviders', ProviderController.getProviders);

router.post('/getProvider', ProviderController.getProvider);

router.post('/getProviderUsers', ProviderController.getProviderUsers);


export default router;
