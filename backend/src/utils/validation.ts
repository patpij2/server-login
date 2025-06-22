export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate required fields
   */
  static validateRequiredFields(data: any, fields: string[]): { isValid: boolean; missingFields?: string[] } {
    const missingFields = fields.filter(field => !data[field] || data[field].trim() === '');
    
    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.length > 0 ? missingFields : undefined
    };
  }

  /**
   * Sanitize input string
   */
  static sanitizeString(input: string): string {
    return input.trim().toLowerCase();
  }

  /**
   * Validate user registration data
   */
  static validateRegistrationData(data: any): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // Check required fields
    const requiredValidation = this.validateRequiredFields(data, ['email', 'password']);
    if (!requiredValidation.isValid) {
      errors.push(`Missing required fields: ${requiredValidation.missingFields?.join(', ')}`);
    }

    // Validate email format
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Validate password length
    if (data.password && data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
} 