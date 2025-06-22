/**
 * 📤 RESPONSE HELPER - Standardized API responses
 * 
 * This utility provides consistent response formatting across all API endpoints
 */

import { Response } from 'express';
import { ApiResponse } from '../models/commonTypes';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

export class ResponseHelper {
  /**
   * Send a successful response
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = HTTP_STATUS.OK
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message: message || 'Operation completed successfully',
      data,
    };
    res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    message?: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ): void {
    const response: ApiResponse = {
      success: false,
      message: message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    };
    res.status(statusCode).json(response);
  }

  /**
   * Send a "not found" response
   */
  static notFound(res: Response, message?: string): void {
    this.error(res, message || 'Resource not found', HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Send a "bad request" response
   */
  static badRequest(res: Response, message?: string): void {
    this.error(res, message || 'Bad request', HTTP_STATUS.BAD_REQUEST);
  }

  /**
   * Send an "unauthorized" response
   */
  static unauthorized(res: Response, message?: string): void {
    this.error(res, message || ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Send a "created" response
   */
  static created<T>(res: Response, data?: T, message?: string): void {
    this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * Send a validation error response
   */
  static validationError(res: Response, errors: string[]): void {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      data: { errors },
    };
    res.status(HTTP_STATUS.BAD_REQUEST).json(response);
  }
} 