import { supabase } from '../config/database';
import { UserResponse, ApiResponse } from '../models/types';

export class UserService {
  /**
   * Get all users (for testing - remove in production!)
   */
  static async getAllUsers(): Promise<ApiResponse<UserResponse[]>> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          message: 'Error fetching users'
        };
      }

      return {
        success: true,
        message: 'Users fetched successfully',
        data: users || []
      };
    } catch (error) {
      console.error('Get users error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ApiResponse<UserResponse>> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User fetched successfully',
        data: user
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<ApiResponse<UserResponse>> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .eq('email', email)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User fetched successfully',
        data: user
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }
} 