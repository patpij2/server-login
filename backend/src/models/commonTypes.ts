/**
 * 🔧 COMMON TYPES
 * 
 * This file defines shared TypeScript interfaces used across the application
 */

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

/**
 * ValidationResult - Result of input validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  missingFields?: string[];
}

/**
 * JwtPayload - Structure of JWT token payload
 */
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * AuthenticatedRequest - Request with user data from JWT
 */
export interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
  };
} 