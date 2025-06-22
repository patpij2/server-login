/**
 * 🔐 UTILS/BCRYPT - The "Password Security" tools
 * 
 * This file handles all password-related security operations.
 * Think of it like a secure vault for storing passwords safely.
 * 
 * IMPORTANT: We NEVER store passwords as plain text!
 * Instead, we "hash" them (convert them to a secret code).
 * 
 * Example:
 * Password: "hello123" → Hash: "$2a$10$abc123def456..." (impossible to reverse)
 */

import bcrypt from 'bcryptjs';
import { config } from '../config/environment';

/**
 * BcryptUtils - Password security utilities
 * 
 * This class contains all the tools we need to handle passwords safely.
 * Think of it like a security toolkit.
 */
export class BcryptUtils {
  /**
   * 🔒 hashPassword - Convert plain password to secure hash
   * 
   * This function takes a plain password (like "hello123") and converts it
   * to a secure hash that can't be reversed back to the original password.
   * 
   * How it works:
   * 1. Take plain password: "hello123"
   * 2. Add random "salt" (extra security)
   * 3. Hash it multiple times (config.bcrypt.saltRounds = 10)
   * 4. Return: "$2a$10$abc123def456..." (secure hash)
   * 
   * @param password - The plain text password from user
   * @returns Promise<string> - The secure hash to store in database
   * 
   * Example:
   * const hash = await BcryptUtils.hashPassword("hello123");
   * // hash = "$2a$10$abc123def456..."
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  /**
   * 🔍 comparePassword - Check if password matches hash
   * 
   * This function checks if a plain password matches a stored hash.
   * We use this when someone tries to login.
   * 
   * How it works:
   * 1. User enters: "hello123"
   * 2. We have stored: "$2a$10$abc123def456..."
   * 3. Function checks: Does "hello123" match the hash?
   * 4. Returns: true (if match) or false (if no match)
   * 
   * @param password - Plain password from login form
   * @param hash - Stored hash from database
   * @returns Promise<boolean> - true if password matches, false if not
   * 
   * Example:
   * const isMatch = await BcryptUtils.comparePassword("hello123", storedHash);
   * // isMatch = true (if password is correct)
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * ✅ validatePassword - Check if password meets requirements
   * 
   * This function checks if a password is strong enough before we accept it.
   * It's like a bouncer checking if someone meets the dress code.
   * 
   * Current rules:
   * - Must be at least 6 characters long
   * 
   * You can add more rules here:
   * - Must contain uppercase letter
   * - Must contain number
   * - Must contain special character
   * 
   * @param password - Password to validate
   * @returns Object with validation result and error message
   * 
   * Example:
   * const result = BcryptUtils.validatePassword("hi");
   * // result = { isValid: false, message: "Password must be at least 6 characters long" }
   */
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    // Check minimum length
    if (password.length < 6) {
      return { 
        isValid: false, 
        message: 'Password must be at least 6 characters long' 
      };
    }
    
    // Add more validation rules here:
    // if (!/[A-Z]/.test(password)) {
    //   return { isValid: false, message: 'Password must contain uppercase letter' };
    // }
    
    // Password passed all checks
    return { isValid: true };
  }
}

/**
 * 💡 SECURITY BEST PRACTICES:
 * 
 * 1. ✅ ALWAYS hash passwords before storing
 * 2. ✅ NEVER store plain text passwords
 * 3. ✅ Use strong hashing algorithms (bcrypt is good)
 * 4. ✅ Add salt to prevent rainbow table attacks
 * 5. ✅ Validate password strength
 * 6. ✅ Use environment variables for configuration
 * 
 * 🚫 WHAT NOT TO DO:
 * - Don't store passwords as plain text
 * - Don't use weak hashing (MD5, SHA1)
 * - Don't use the same salt for all passwords
 * - Don't send passwords in error messages
 * 
 * 🔍 HOW TO TEST:
 * 
 * // Test password hashing
 * const password = "hello123";
 * const hash = await BcryptUtils.hashPassword(password);
 * console.log("Hash:", hash);
 * 
 * // Test password comparison
 * const isMatch = await BcryptUtils.comparePassword(password, hash);
 * console.log("Password matches:", isMatch); // Should be true
 * 
 * // Test password validation
 * const validation = BcryptUtils.validatePassword("hi");
 * console.log("Password valid:", validation.isValid); // Should be false
 */ 