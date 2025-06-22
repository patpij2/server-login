/**
 * 🏗️ MODELS/TYPES - The "Recipe Book" of our application
 * 
 * This file defines what our data looks like - like a recipe book tells you
 * what ingredients you need and what the final dish should look like.
 * 
 * In programming, we call these "TypeScript interfaces" - they define the shape
 * of our data so we don't make mistakes.
 */

// 👤 USER-RELATED TYPES
// These define what a user looks like in our system

/**
 * User - The complete user data (including sensitive info like password hash)
 * This is what we store in the database
 */
export interface User {
  id: string;              // Unique identifier (like a social security number)
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

// 📨 REQUEST/RESPONSE TYPES
// These define what data comes in and goes out of our API

/**
 * RegisterRequest - What the frontend sends when someone wants to register
 * Example: { email: "john@example.com", password: "secret123" }
 */
export interface RegisterRequest {
  email: string;           // User's email
  password: string;        // User's password (plain text, we'll hash it)
}

/**
 * LoginRequest - What the frontend sends when someone wants to login
 * Example: { email: "john@example.com", password: "secret123" }
 */
export interface LoginRequest {
  email: string;           // User's email
  password: string;        // User's password (plain text, we'll check it)
}

/**
 * AuthResponse - What we send back after login/register
 * Example: { success: true, message: "Login successful", user: {...} }
 */
export interface AuthResponse {
  success: boolean;        // Did the operation work?
  message: string;         // Human-readable message
  user?: UserResponse;     // User data (only if successful)
  token?: string;          // JWT token (only if successful)
}

/**
 * ApiResponse - Generic response format for any API call
 * The <T> means "any type" - we can use this for different kinds of data
 * Example: ApiResponse<UserResponse[]> for list of users
 */
export interface ApiResponse<T = any> {
  success: boolean;        // Did the operation work?
  message: string;         // Human-readable message
  data?: T;               // The actual data (only if successful)
}

// 🗄️ DATABASE TYPES
// These match exactly what's in our Supabase database

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