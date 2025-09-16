import { Request, Response } from 'express';
import { sanitizePath } from './sanitizePath'

export const getEncodedClientOrigin = (req: Request): string => {
    const clientOrigin = req.get('Origin')
    const encodedClientOrigin = encodeURIComponent(clientOrigin as string);
    const sanitizedClientOrigin = sanitizePath(encodedClientOrigin)

    return sanitizedClientOrigin;
}