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
}