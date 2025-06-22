import { supabase } from '../config/database';
import { UserResponse, ApiResponse } from '../models/types';
import { Logger } from '../utils/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

export class UserService {
  /**
   * Get all users (for testing - remove in production!)
   */
  static async getAllUsers(): Promise<ApiResponse<UserResponse[]>> {
    try {
      Logger.debug('Fetching all users from database', 'UserService');

      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        Logger.error('Database error fetching users', 'UserService', error);
        return {
          success: false,
          message: 'Error fetching users'
        };
      }

      Logger.logDatabase('SELECT', 'users', `Found ${users?.length || 0} users`);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.USERS_FETCHED,
        data: users || []
      };
    } catch (error) {
      Logger.error('Get users error', 'UserService', error as Error);
      return {
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ApiResponse<UserResponse>> {
    try {
      Logger.debug(`Fetching user by ID: ${userId}`, 'UserService');

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .eq('id', userId)
        .single();

      if (error || !user) {
        Logger.warn(`User not found: ${userId}`, 'UserService');
        return {
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        };
      }

      Logger.logDatabase('SELECT', 'users', `Found user: ${user.email}`);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.USER_FETCHED,
        data: user
      };
    } catch (error) {
      Logger.error('Get user error', 'UserService', error as Error);
      return {
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<ApiResponse<UserResponse>> {
    try {
      Logger.debug(`Fetching user by email: ${email}`, 'UserService');

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .eq('email', email)
        .single();

      if (error || !user) {
        Logger.warn(`User not found by email: ${email}`, 'UserService');
        return {
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        };
      }

      Logger.logDatabase('SELECT', 'users', `Found user by email: ${email}`);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.USER_FETCHED,
        data: user
      };
    } catch (error) {
      Logger.error('Get user by email error', 'UserService', error as Error);
      return {
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      };
    }
  }
} 