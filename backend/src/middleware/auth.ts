/**
 * 🔐 AUTH MIDDLEWARE - Protect routes with JWT authentication
 * 
 * This middleware checks if a user is authenticated before allowing access.
 * Think of it like a security guard checking ID cards.
 */

import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt';
import { UserResponse } from '../models/types';
import { config } from '../config/environment';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserResponse;
    }
  }
}

/**
 * authenticateToken - Middleware to check JWT token
 * 
 * This function:
 * 1. Gets token from request header
 * 2. Verifies the token is valid
 * 3. Adds user data to request object
 * 4. Allows request to continue or blocks it
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    console.log('--- Backend Auth Middleware ---'); // DEBUG
    console.log('Auth Header Received:', authHeader); // DEBUG

    const token = authHeader && authHeader.split(' ')[1];
    console.log('Token Extracted:', token); // DEBUG

    if (!token) {
      res.status(401).json({ success: false, message: 'Access token required' });
      return;
    }

    // This is the most important log! Let's see the secret.
    console.log('Verifying with JWT_SECRET:', config.jwt.secret); // DEBUG

    const user = JWTUtils.verifyToken(token);
    console.log('Token Verified Successfully! User:', user); // DEBUG
    
    req.user = user;
    next();
    
  } catch (error) {
    // This will now show us exactly why verification failed
    console.error('Authentication Error:', error); // DEBUG
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 *  HOW THIS WORKS:
 * 
 * 1. Frontend sends request with token in header:
 *    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * 2. Middleware extracts token from header
 * 
 * 3. Middleware verifies token and gets user data
 * 
 * 4. If valid: Adds user data to request and continues
 *    If invalid: Returns 401 error
 * 
 * 5. Route handler can access user data via req.user
 */