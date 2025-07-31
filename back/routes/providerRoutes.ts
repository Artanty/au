import express from 'express';
import { ProviderController } from '../controllers/providerController';


const router = express.Router();


router.post('/getProviders', ProviderController.getProviders);


export default router;
