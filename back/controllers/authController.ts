import { Request, Response } from 'express';
import { UserModel, IUser } from '../models/userModel';
import { FieldMapping, ProviderService } from '../models/providerService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ensureErr, err } from '../utils/throwError';
import { decrypt, encrypt } from '../utils/encrypt';
import { deleteFile, getUserHandlerAndTokens, sanitizePath, saveTemp } from './saveTempController';
import { getEncodedClientOrigin } from '../utils/getEncodedClientOrigin';
import { UserController } from './userController';
import { dd } from '../utils/dd';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const LOGIN_FIELD = 'email'

export class AuthController {
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
      const { email, password, provider: providerId } = req.body;

      if (providerId) {
        await AuthController.handleExternalLogin(req, res, providerId, { email, password });
      } else {
        await AuthController.handleInternalLogin(req, res, { email, password });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * back: удаляем файл из storage
   * web: следующий запрос с фронта вернет 401 и очистит токен
   * */
  public static async logout(req: Request, res: Response) {
    try {
      const path = getEncodedClientOrigin(req);
      const fileName = `userHandler.json`;

      const success = await deleteFile(path, fileName);
      if (success) {
        console.log('File deleted successfully');
        return res.status(200).json({
          success: true,
          message: 'Successfully logged out'
        });
      } else {
        throw new Error('smth wrong');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed: ' + error });
    }
  }

  private static async handleInternalLogin(req: Request, res: Response, credentials: { email: string, password: string }) {
    const user = await UserModel.getByEmail(credentials.email);
    if (!user || !(await bcrypt.compare(credentials.password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      const hostOrigin = encodeURIComponent(`${req.protocol}://${req.get('host')}`)
      const tokens = AuthController.generateTokens(user.id!, hostOrigin);
      const userData = AuthController.sanitizeUser(user);
    
      res.json({ ...tokens, user: userData });
    }    
  }

  private static async handleExternalLogin(req: Request, res: Response, providerId: string, credentials: { email: string, password: string }) {
    let externalModel;
    try {
      // todo copy to retrieve userName 
      const provider = await ProviderService.getProvider(providerId);
      externalModel = await ProviderService.createExternalModel(provider);

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
        const mappedUser = AuthController.mapUserData(externalUser, provider.mappings);

        const clientOrigin = getEncodedClientOrigin(req);

        const tokens = AuthController.generateTokens(mappedUser.id, clientOrigin);

        const userHandler = encrypt(provider.id, mappedUser.id);

        const userName = mappedUser.name; // add profile table: proflie.userName ?? mappedUser.name

        const avatar = await UserController.getAvatar(userName)
        
        await saveTemp({
          path: clientOrigin,
          fileName: `userHandler.json`,
          data: { 
            userHandler,
            ...tokens,
            userName,
            avatar,
          }
        })
        
        res.json({ 
          ...tokens,
          // user: AuthController.sanitizeUser(mappedUser as IUser),
          userName: userName,
          // provider: provider.name,
          
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
      acc[mapping.internal_claim] = AuthController.transformValue(
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

  private static generateTokens(userId: string | number, hostOrigin: string) {
    return {
      accessToken: (jwt as any).sign({ id: userId, hostOrigin }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }),
      refreshToken: jwt.sign({ id: userId, hostOrigin }, JWT_SECRET, { expiresIn: '30d' })
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

  public static async checkToken(req: Request, res: Response) {
    try {
      const accessToken = req.body.accessToken
      if (!accessToken) {
        throw new Error('No access token provided.')
      }
      const clientOrigin = getEncodedClientOrigin(req);
      const savedTempData = await getUserHandlerAndTokens(clientOrigin, 'userHandler.json');
      if (!savedTempData) {
        throw new Error('File problem.')
      }
      return res.json({
        // data: {
        //   userName: savedTempData.userName,
        // }

        userName: savedTempData.userName,
        
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Check token failed: ' + String(error) });
    }
  }

  public static async encrypt(req: Request, res: Response) {
    try {
      const targetUserProviderId = req.body.targetUserProviderId;
      const targetUserId = req.body.targetUserId;
      const userHandler = encrypt(targetUserProviderId, targetUserId)

      return res.json({ userHandler })
    } catch (error: any) {
      res.status(500).json({ error: 'encrypt user failed: ' + String(error) });
    }
  }

  public static async decrypt(req: Request, res: Response) {
    dd('[DECRYPT] START')
    try {
      const result: any = []
      const providersIds = new Map<string, Set<string>>()
      const decryptedUsersHandlers: Record<string, any> = {};
    
      if (req.body.usersHandlers && Array.isArray(req.body.usersHandlers)) {
        req.body.usersHandlers.forEach(userHandler => {
          const [providerId, userId] = decrypt(userHandler)
          decryptedUsersHandlers[userId] = {
            userHandler,
            providerId,
          };
          let setOfUsers;
          const isInStore = providersIds.has(providerId)
          if (isInStore) {
            setOfUsers = providersIds.get(providerId) as Set<string>
            setOfUsers.add(userId)
          } else {
            setOfUsers = new Set([userId])
          }
          providersIds.set(providerId, setOfUsers)
        })

        const providerPromises = Array.from(providersIds).map(async ([providerId, usersIds]: [string, Set<string>]) => {
          const provider = await ProviderService.getProvider(providerId);
          const externalModel = await ProviderService.createExternalModel(provider);
          const usersData: any[] = await externalModel.getUsersByIds(Array.from(usersIds));
          return usersData;
        });
      
        const allUsersData = await Promise.all(providerPromises);
      
        result.push(...allUsersData.flat());
      }
    
      let enrichedUsersData = result
        .map(userData => ({ ...userData, ...decryptedUsersHandlers[userData.id] }));

      enrichedUsersData = enrichedUsersData.map(async (enrichedUserData: any) => {
        const avatar = await UserController.getAvatar(enrichedUserData.name)
        return { ...enrichedUserData, avatar }
      })
      
      enrichedUsersData = await Promise.all(enrichedUsersData);
      return res.json({ enrichedUsersData })
    } catch (error: any) {
      res.status(500).json({ error: 'decrypt users failed: ' + String(error) });
    }
  }
}
