import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  /**
   * Get all users (for testing - remove in production!)
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await UserService.getAllUsers();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get users controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await UserService.getUserById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Get user controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Health check
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Login API server is running with Supabase!',
      endpoints: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        users: 'GET /api/users',
        health: 'GET /api/health'
      }
    });
  }
} 