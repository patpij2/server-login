/**
 * 👤 USER-RELATED TYPES
 * 
 * This file defines all user-related TypeScript interfaces
 */

/**
 * User - The complete user data (including sensitive info like password hash)
 * This is what we store in the database
 */
export interface User {
  id: string;              // Unique identifier
  email: string;           // User's email address
  password_hash: string;   // Encrypted password (never store plain passwords!)
  created_at: string;      // When the user was created
  updated_at: string;      // When the user was last updated
}

/**
 * UserResponse - What we send back to the frontend (safe data only)
 * Notice: NO password_hash here! We never send passwords to the frontend
 */
export interface UserResponse {
  id: string;              // User ID
  email: string;           // Email address
  created_at: string;      // When created
}

/**
 * RegisterRequest - What the frontend sends when someone wants to register
 */
export interface RegisterRequest {
  email: string;           // User's email
  password: string;        // User's password (plain text, we'll hash it)
}

/**
 * LoginRequest - What the frontend sends when someone wants to login
 */
export interface LoginRequest {
  email: string;           // User's email
  password: string;        // User's password (plain text, we'll check it)
}

/**
 * AuthResponse - What we send back after login/register
 */
export interface AuthResponse {
  success: boolean;        // Did the operation work?
  message: string;         // Human-readable message
  user?: UserResponse;     // User data (only if successful)
  token?: string;          // JWT token (only if successful)
}

/**
 * DatabaseUser - Exactly what we get from the database
 * This matches our Supabase table structure
 */
export interface DatabaseUser {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
} 