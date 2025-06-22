import { supabase } from '../config/database';
import { BcryptUtils } from '../utils/bcrypt';
import { ValidationUtils } from '../utils/validation';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse, 
  UserResponse,
  DatabaseUser 
} from '../models/types';
import { JWTUtils } from '../utils/jwt';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate input data
      const validation = ValidationUtils.validateRegistrationData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors?.join(', ') || 'Invalid input data'
        };
      }

      const { email, password } = data;
      const sanitizedEmail = ValidationUtils.sanitizeString(email);

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', sanitizedEmail)
        .single();

      if (existingUser) {
        return {
          success: false,
          message: 'User already exists'
        };
      }

      // Hash password
      const hashedPassword = await BcryptUtils.hashPassword(password);

      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email: sanitizedEmail,
            password_hash: hashedPassword
          }
        ])
        .select('id, email, created_at')
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return {
          success: false,
          message: 'Error creating user'
        };
      }

      const userResponse: UserResponse = {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at
      };

      // Generate JWT token for new user
      const token = JWTUtils.generateToken(userResponse);

      console.log(`User registered: ${sanitizedEmail}`);
      return {
        success: true,
        message: 'User registered successfully',
        user: userResponse,
        token: token
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input data
      const requiredValidation = ValidationUtils.validateRequiredFields(data, ['email', 'password']);
      if (!requiredValidation.isValid) {
        return {
          success: false,
          message: `Missing required fields: ${requiredValidation.missingFields?.join(', ')}`
        };
      }

      const { email, password } = data;
      const sanitizedEmail = ValidationUtils.sanitizeString(email);

      // Get user from database
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('id, email, password_hash, created_at')
        .eq('email', sanitizedEmail)
        .single();

      if (fetchError || !user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check password
      const isPasswordValid = await BcryptUtils.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      };

      // Generate JWT token for logged-in user
      const token = JWTUtils.generateToken(userResponse);

      console.log(`User logged in: ${sanitizedEmail}`);
      return {
        success: true,
        message: 'Login successful',
        user: userResponse,
        token: token
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }
} 