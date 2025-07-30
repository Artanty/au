import { Request, Response } from 'express';
import { UserModel, IUser } from '../models/userModel';
import { FieldMapping, ProviderService } from '../models/providerService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ensureErr, err } from '../utils/throwError';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const LOGIN_FIELD = 'email'

export class UserController {
  public static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await UserModel.create({
        username,
        email,
        password_hash: hashedPassword
      });

      // const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
      
      // res.status(201).json({ user, token });
      res.status(201).json({ [LOGIN_FIELD]: user[LOGIN_FIELD] });

    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password, provider: providerName } = req.body;

      if (providerName) {
        await UserController.handleExternalLogin(res, providerName, { email, password });
      } else {
        await UserController.handleInternalLogin(res, { email, password });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }


  public static async logout(req: Request, res: Response) {
  
    // try {
    //   await UserModel.logout(req.body.refreshToken)
    // } catch (error: any) {
    //   console.error('Logout error:', error);
    //   res.status(500).json({ error: 'Logout failed' });
    // } 
  }

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

  private static async handleInternalLogin(res: Response, credentials: { email: string, password: string }) {
    const user = await UserModel.getByEmail(credentials.email);
    if (!user || !(await bcrypt.compare(credentials.password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      const tokens = UserController.generateTokens(user.id!);
      const userData = UserController.sanitizeUser(user);
    
      res.json({ ...tokens, user: userData });
    }    
  }

  private static async handleExternalLogin(res: Response, providerName: string, credentials: { email: string, password: string }) {
    let externalModel;
    try {

      const provider = await ProviderService.getProvider(providerName);
      externalModel = await ProviderService.createExternalModel(providerName);

      // Find field mappings
      const emailField = provider.mappings.find((m: any) => m.internal_claim === 'email');
      const passwordField = provider.mappings.find((m: any) => m.internal_claim === 'password_hash');

      if (!emailField || !passwordField) {
        throw new Error('Missing required field mappings');
      }

      const externalUser = await externalModel?.getUserByCredential(
        { emailField: emailField.external_field, passwordField: passwordField.external_field },
        credentials
      );

      if (!externalUser) {
        res.status(401).json({ error: 'Invalid credentials' });
      } else {
        // Map fields according to provider configuration
        const mappedUser = UserController.mapUserData(externalUser, provider.mappings);
        const tokens = UserController.generateTokens(mappedUser.id);

        res.json({ 
          ...tokens, 
          user: UserController.sanitizeUser(mappedUser as IUser), //todo type
          provider: provider.name 
        });
      }

    } catch (error: any) {
      err(error)
    } 
    finally {
      if (!(externalModel instanceof Error)) {
        await externalModel?.closePool();  
      }
      
    }
  }

  private static mapUserData(externalUser: any, mappings: FieldMapping[]) {
    return mappings.reduce((acc, mapping) => {
      acc[mapping.internal_claim] = UserController.transformValue(
        externalUser[mapping.external_field],
        mapping.transform
      );
      return acc;
    }, {} as Record<string, any>);
  }

  private static transformValue(value: any, transform?: string) {
    if (value === undefined) return value;
    switch (transform) {
      case 'lowercase': return String(value).toLowerCase();
      case 'trim': return String(value).trim();
      default: return value;
    }
  }

  private static generateTokens(userId: string | number) {
    return {
      accessToken: (jwt as any).sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }),
      refreshToken: jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' })
    };
  }

  private static sanitizeUser(user: IUser) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    };
  }
}


  






//   // Refresh Token
//   static async refreshToken({ refreshToken }: { refreshToken: string }) {
//     const pool = createPool();
//     const connection = await pool.getConnection();

//     try {
//       // Verify the refresh token
//       const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!);

//       // Check if the refresh token exists in the database
//       const [tokens] = await connection.query('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
//       if (tokens.length === 0) {
//         throw new Error('Invalid refresh token');
//       }

//       // Generate a new access token
//       const accessToken = this.generateToken((decoded as any).id);

//       connection.release();
//       return { accessToken };
//     } catch (error: any) {
//       connection.release();
//       throw new Error(error.message);
//     }
//   }

//   // Helper function to generate tokens
//   static generateToken(userId: string | number | undefined) {
//     if (!userId) throw new Error('not user id');
//     userId = String(userId)
//     return (jwt.sign as any)(
//       { id: userId }, 
//       JWT_SECRET, 
//       { expiresIn: JWT_EXPIRES_IN }
//     );
//   }

//   static generateRefreshToken(userId: string | number | undefined) {
//     if (!userId) throw new Error('not user id');
//     userId = String(userId)
//     return (jwt.sign as any)(
//       { id: userId }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
//     );
//   }
// }