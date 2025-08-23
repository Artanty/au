import { ProviderService } from "../models/providerService";
import { Request, Response } from 'express';

export class ProviderController {

	public static async getProviders(req: Request, res: Response) {
		try {
			const providers = await ProviderService.getProviders();

			res.status(201).json({ data: providers });

		} catch (error) {
			console.error(error)
			res.status(500).json({ error: 'getProviders failed' });
		}
	}

	public static async getProvider(req: Request, res: Response) {
		try {
			const providers = await ProviderService.getProvider(req.body.id);

			res.status(201).json({ data: providers });

		} catch (error) {
			console.error(error)
			res.status(500).json({ error: 'getProviders failed' });
		}
	}

	public static async getProviderUsers(req: Request, res: Response) {
		try {
			const providers = await ProviderService.getProviderUsers(req.body.id);

			res.status(201).json({ data: providers });

		} catch (error) {
			console.error(error)
			res.status(500).json({ error: 'getProviders failed' });
		}
	}

	
}