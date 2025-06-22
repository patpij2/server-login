import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest } from '../models/types';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: RegisterRequest = req.body;

      const result = await AuthService.register({ email, password });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Registration controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      const result = await AuthService.login({ email, password });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
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
       res.status(401).json({
         success: false,
         message: 'User not authenticated'
       });
       return;
     }
      res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved',
        data: {
          user: user
        }
      });
    } catch (error) {
      console.error('Dashboard controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

} 