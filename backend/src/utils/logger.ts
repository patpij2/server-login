/**
 * 📝 LOGGER - Centralized logging utility
 * 
 * This utility provides consistent logging across the application
 * with different log levels and formatting
 */

import { API_CONFIG } from '../config/constants';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export class Logger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  private static formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = this.getTimestamp();
    const contextStr = context ? ` [${context}]` : '';
    return `${timestamp} ${level}${contextStr}: ${message}`;
  }

  /**
   * Log an error message
   */
  static error(message: string, context?: string, error?: Error): void {
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, context);
    console.error(formattedMessage);
    
    if (error && API_CONFIG.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * Log a warning message
   */
  static warn(message: string, context?: string): void {
    const formattedMessage = this.formatMessage(LogLevel.WARN, message, context);
    console.warn(formattedMessage);
  }

  /**
   * Log an info message
   */
  static info(message: string, context?: string): void {
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, context);
    console.log(formattedMessage);
  }

  /**
   * Log a debug message (only in development)
   */
  static debug(message: string, context?: string): void {
    if (API_CONFIG.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, context);
      console.log(formattedMessage);
    }
  }

  /**
   * Log API request details
   */
  static logRequest(method: string, path: string, statusCode: number, duration: number): void {
    const emoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    this.info(`${emoji} ${method} ${path} - ${statusCode} (${duration}ms)`, 'API');
  }

  /**
   * Log user actions
   */
  static logUserAction(action: string, userId: string, details?: string): void {
    const message = details ? `${action}: ${details}` : action;
    this.info(message, `User:${userId}`);
  }

  /**
   * Log database operations
   */
  static logDatabase(operation: string, table: string, details?: string): void {
    const message = details ? `${operation} on ${table}: ${details}` : `${operation} on ${table}`;
    this.debug(message, 'Database');
  }

  /**
   * Log external API calls
   */
  static logExternalAPI(service: string, operation: string, success: boolean, details?: string): void {
    const status = success ? '✅' : '❌';
    const message = details ? `${operation}: ${details}` : operation;
    this.info(`${status} ${service} - ${message}`, 'ExternalAPI');
  }
} 