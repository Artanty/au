import { Request, Response } from 'express';
import { UserModel, IUser } from '../models/userModel';
import { FieldMapping, ProviderService } from '../models/providerService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ensureErr, err } from '../utils/throwError';
import { encrypt } from '../utils/encrypt';
import { deleteFile, getUserHandlerAndTokens, saveTemp } from './saveTempController';
import { getEncodedClientOrigin } from '../utils/getEncodedClientOrigin';
import axios from 'axios';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const LOGIN_FIELD = 'email'

export class UserController {
  
  public static async getProfile(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    
    // 1. No token provided
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_TOKEN_PROVIDED'
      });
    }

    try {
      // 2. Token verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        
      // 3. Get user ID from either decoded token or body (more secure to use token)
      const userId = decoded.id || (req as any).body.userId;
      if (!userId) {
        return res.status(400).json({
          error: 'User ID not specified',
          code: 'MISSING_USER_ID'
        });
      }

      // 4. Fetch user
      const user = await UserModel.getById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // 5. Success
      return res.json({
        data: user,
        meta: {
          requestedAt: new Date().toISOString()
        }
      });

    } catch (error: unknown) {
      // Handle different JWT error cases
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      // 6. Other unexpected errors
      console.error('Profile fetch error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        code: 'SERVER_ERROR',
        details: ensureErr(error)
      });
    }
  }

  public static async getAvatar(userName): Promise<string> {
    const condencedName = userName.replace(' ', '').trim()
    try {

      const response = await axios.get(
        `https://nekos.best/api/v2/search?query=${condencedName}&type=1`, 
        {
          timeout: 5000
        }
      );

      return response.data.results?.[0]?.url ?? 'NO_AVATAR_URL'
    
    } catch (error: unknown) {
      console.error('getAvatar error: ' + error);
      return 'GET_AVATAR_ERROR';
    }
  }
}
