/**
 * ✅ VALIDATION MIDDLEWARE - Request validation
 * 
 * This middleware validates incoming requests before they reach controllers
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationUtils } from '../utils/validation';
import { ResponseHelper } from '../utils/responseHelper';
import { VALIDATION_CONFIG } from '../config/constants';

export class ValidationMiddleware {
  /**
   * Validate registration data
   */
  static validateRegistration(req: Request, res: Response, next: NextFunction): void {
    const { email, password } = req.body;

    // Check required fields
    const requiredValidation = ValidationUtils.validateRequiredFields({ email, password }, ['email', 'password']);
    if (!requiredValidation.isValid) {
      return ResponseHelper.validationError(res, requiredValidation.missingFields || []);
    }

    // Validate email format
    if (!ValidationUtils.isValidEmail(email)) {
      return ResponseHelper.validationError(res, ['Invalid email format']);
    }

    // Validate email length
    if (email.length > VALIDATION_CONFIG.EMAIL_MAX_LENGTH) {
      return ResponseHelper.validationError(res, [`Email must be less than ${VALIDATION_CONFIG.EMAIL_MAX_LENGTH} characters`]);
    }

    // Validate password length
    if (password.length < 6) {
      return ResponseHelper.validationError(res, ['Password must be at least 6 characters long']);
    }

    if (password.length > 128) {
      return ResponseHelper.validationError(res, ['Password must be less than 128 characters']);
    }

    next();
  }

  /**
   * Validate login data
   */
  static validateLogin(req: Request, res: Response, next: NextFunction): void {
    const { email, password } = req.body;

    // Check required fields
    const requiredValidation = ValidationUtils.validateRequiredFields({ email, password }, ['email', 'password']);
    if (!requiredValidation.isValid) {
      return ResponseHelper.validationError(res, requiredValidation.missingFields || []);
    }

    // Validate email format
    if (!ValidationUtils.isValidEmail(email)) {
      return ResponseHelper.validationError(res, ['Invalid email format']);
    }

    next();
  }

  /**
   * Validate memory content
   */
  static validateMemoryContent(req: Request, res: Response, next: NextFunction): void {
    const { content } = req.body;

    // Check required fields
    if (!content || content.trim() === '') {
      return ResponseHelper.validationError(res, ['Memory content cannot be empty']);
    }

    // Validate content length
    if (content.length > VALIDATION_CONFIG.CONTENT_MAX_LENGTH) {
      return ResponseHelper.validationError(res, [`Memory content must be less than ${VALIDATION_CONFIG.CONTENT_MAX_LENGTH} characters`]);
    }

    next();
  }

  /**
   * Validate search query
   */
  static validateSearchQuery(req: Request, res: Response, next: NextFunction): void {
    const { query } = req.body;

    // Check required fields
    if (!query || query.trim() === '') {
      return ResponseHelper.validationError(res, ['Search query cannot be empty']);
    }

    // Validate query length
    if (query.length > VALIDATION_CONFIG.QUERY_MAX_LENGTH) {
      return ResponseHelper.validationError(res, [`Search query must be less than ${VALIDATION_CONFIG.QUERY_MAX_LENGTH} characters`]);
    }

    next();
  }

  /**
   * Validate question
   */
  static validateQuestion(req: Request, res: Response, next: NextFunction): void {
    const { question } = req.body;

    // Check required fields
    if (!question || question.trim() === '') {
      return ResponseHelper.validationError(res, ['Question is required']);
    }

    // Validate question length
    if (question.length > VALIDATION_CONFIG.QUERY_MAX_LENGTH) {
      return ResponseHelper.validationError(res, [`Question must be less than ${VALIDATION_CONFIG.QUERY_MAX_LENGTH} characters`]);
    }

    next();
  }

  /**
   * Validate user ID parameter
   */
  static validateUserId(req: Request, res: Response, next: NextFunction): void {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return ResponseHelper.badRequest(res, 'User ID is required');
    }

    // Basic UUID validation (you might want to use a proper UUID validation library)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return ResponseHelper.badRequest(res, 'Invalid user ID format');
    }

    next();
  }
} 