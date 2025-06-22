/**
 * 🔐 JWT UTILS - Token management utilities
 * 
 * This file handles creating and validating JWT tokens.
 * Think of it like a secure ID card system.
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { UserResponse } from '../models/types';

/**
 * JWTUtils - Token management utilities
 */
export class JWTUtils {
  /**
   * 🔑 generateToken - Create a JWT token for a user
   * 
   * This creates a secure token that contains user information.
   * The token can be used to identify the user without storing data in the browser.
   * 
   * @param user - User data to include in token
   * @returns string - The JWT token
   * 
   * Example:
   * const token = JWTUtils.generateToken({ id: "123", email: "john@example.com" });
   * // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  static generateToken(user: UserResponse): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn // Token expires in 24 hours
      }
    );
  }

  /**
   * 🔍 verifyToken - Check if a token is valid and get user data
   * 
   * This function takes a token and verifies it's valid.
   * If valid, it returns the user data from the token.
   * If invalid, it throws an error.
   * 
   * @param token - The JWT token to verify
   * @returns UserResponse - User data from token
   * 
   * Example:
   * const user = JWTUtils.verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
   * // user = { id: "123", email: "john@example.com", created_at: "..." }
   */
  static verifyToken(token: string): UserResponse {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as UserResponse;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * 📅 isTokenExpired - Check if token is expired
   * 
   * @param token - The JWT token to check
   * @returns boolean - true if expired, false if valid
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true; // If we can't verify, consider it expired
    }
  }
}

/**
 * 💡 HOW JWT WORKS:
 * 
 * 1. User logs in → Backend creates JWT token with user data
 * 2. Frontend stores token → Sends token with every request
 * 3. Backend validates token → Extracts user data from token
 * 4. If token valid → Allow access, if invalid → Deny access
 * 
 * �� SECURITY:
 * - Tokens are signed with secret key
 * - Tokens expire after 24 hours
 * - Tokens contain user data (no need to query database)
 * - Tokens can't be tampered with (cryptographically signed)
 */