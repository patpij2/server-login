/**
 * 🔧 CONSTANTS - Application-wide constants
 * 
 * This file centralizes all configuration values and magic numbers
 * used throughout the application.
 */

// API Configuration
export const API_CONFIG = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  EXPIRES_IN: '24h',
  ALGORITHM: 'HS256',
} as const;

// Password Configuration
export const PASSWORD_CONFIG = {
  SALT_ROUNDS: 12,
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
} as const;

// Validation Configuration
export const VALIDATION_CONFIG = {
  EMAIL_MAX_LENGTH: 254,
  CONTENT_MAX_LENGTH: 10000,
  QUERY_MAX_LENGTH: 500,
} as const;

// Memory/AI Configuration
export const MEMORY_CONFIG = {
  MAX_CONTEXT_LENGTH: 1000,
  TOP_MEMORIES_COUNT: 3,
  MAX_TOKENS: 500,
  TEMPERATURE: 1,
  MODEL: 'google/gemini-2.0-flash-001',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    DASHBOARD: '/auth/dashboard',
  },
  USERS: {
    ALL: '/users',
    BY_ID: '/users/:id',
  },
  MEMORIES: {
    ADD: '/memories/add',
    SEARCH: '/memories/search',
    ASK: '/memories/ask',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ALREADY_EXISTS: 'User already exists',
  UNAUTHORIZED: 'User not authenticated',
  INVALID_INPUT: 'Invalid input data',
  MEMORY_CONTENT_EMPTY: 'Memory content cannot be empty',
  SEARCH_QUERY_EMPTY: 'Search query cannot be empty',
  QUESTION_EMPTY: 'Question is required',
  NO_MEMORIES_FOUND: 'No relevant memories found to answer your question',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  USERS_FETCHED: 'Users fetched successfully',
  USER_FETCHED: 'User fetched successfully',
  MEMORY_ADDED: 'Memory added successfully!',
  SEARCH_COMPLETED: 'Search completed successfully!',
  DASHBOARD_RETRIEVED: 'Dashboard data retrieved',
} as const; 