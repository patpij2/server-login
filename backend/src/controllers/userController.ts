import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ResponseHelper } from '../utils/responseHelper';
import { Logger } from '../utils/logger';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

export class UserController {
  /**
   * Get all users (for testing - remove in production!)
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      Logger.debug('Getting all users', 'UserController');
      
      const result = await UserService.getAllUsers();

      if (result.success) {
        ResponseHelper.success(res, result.data, SUCCESS_MESSAGES.USERS_FETCHED);
      } else {
        ResponseHelper.error(res, result.message);
      }
    } catch (error) {
      Logger.error('Get users controller error', 'UserController', error as Error);
      ResponseHelper.error(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      Logger.debug(`Getting user by ID: ${id}`, 'UserController');

      const result = await UserService.getUserById(id);

      if (result.success) {
        ResponseHelper.success(res, result.data, SUCCESS_MESSAGES.USER_FETCHED);
      } else {
        ResponseHelper.notFound(res, result.message);
      }
    } catch (error) {
      Logger.error('Get user controller error', 'UserController', error as Error);
      ResponseHelper.error(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Health check
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    Logger.info('Health check requested', 'UserController');
    
    ResponseHelper.success(res, {
      message: 'Login API server is running with Supabase!',
      endpoints: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        users: 'GET /api/users',
        health: 'GET /api/health'
      }
    }, 'Server is healthy');
  }
} 