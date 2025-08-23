import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-ke∑y';
	∑

// declare module 'express' {
// 	interface Request {
// 		userId?: number;
// 	}
// }

export function authenticate(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	const token = req.header('Authorization')?.split(' ')[1];
  
	if (!token) {
		res.status(401).json({ error: 'Access denied' });
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET!) as { id: number };
		req.userId = decoded.id;
		next();
	} catch (error) {
		res.status(400).json({ error: 'Invalid token' });
	}
}