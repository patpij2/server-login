import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest } from '../models/userTypes';
import { ResponseHelper } from '../utils/responseHelper';
import { Logger } from '../utils/logger';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: RegisterRequest = req.body;
      Logger.info(`Registration attempt for: ${email}`, 'AuthController');

      const result = await AuthService.register({ email, password });

      if (result.success) {
        Logger.logUserAction('Registered', result.user?.id || 'unknown', email);
        ResponseHelper.created(res, { user: result.user, token: result.token }, SUCCESS_MESSAGES.USER_REGISTERED);
      } else {
        ResponseHelper.badRequest(res, result.message);
      }
    } catch (error) {
      Logger.error('Registration controller error', 'AuthController', error as Error);
      ResponseHelper.error(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;
      Logger.info(`Login attempt for: ${email}`, 'AuthController');

      const result = await AuthService.login({ email, password });

      if (result.success) {
        Logger.logUserAction('Logged in', result.user?.id || 'unknown', email);
        ResponseHelper.success(res, { user: result.user, token: result.token }, SUCCESS_MESSAGES.LOGIN_SUCCESSFUL);
      } else {
        ResponseHelper.unauthorized(res, result.message);
      }
    } catch (error) {
      Logger.error('Login controller error', 'AuthController', error as Error);
      ResponseHelper.error(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get dashboard data (current user info)
   */
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      // req.user is set by the authenticateToken middleware
      const user = req.user;
      
      if (!user) {
        return ResponseHelper.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      }

      Logger.debug(`Dashboard requested for user: ${user.id}`, 'AuthController');
      
      ResponseHelper.success(res, { user }, SUCCESS_MESSAGES.DASHBOARD_RETRIEVED);
    } catch (error) {
      Logger.error('Dashboard controller error', 'AuthController', error as Error);
      ResponseHelper.error(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
} 