import { supabase } from '../config/database';
import { GmailCredentials } from './gmailService';
import { Logger } from '../utils/logger';

export interface StoredGmailCredentials {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
  created_at: string;
  updated_at: string;
}

export class GmailCredentialsService {
  private static readonly TABLE_NAME = 'gmail_credentials';

  /**
   * Store Gmail credentials for a user
   */
  static async storeCredentials(userId: string, credentials: GmailCredentials): Promise<void> {
    try {
      Logger.info(`Storing Gmail credentials for user: ${userId}`, 'GmailCredentialsService');
      Logger.info(`Table name: ${this.TABLE_NAME}`, 'GmailCredentialsService');
      
      // Check if credentials already exist for this user
      Logger.info('Checking for existing credentials...', 'GmailCredentialsService');
      const { data: existing, error: selectError } = await supabase
        .from(this.TABLE_NAME)
        .select('id')
        .eq('user_id', userId)
        .single();

      if (selectError) {
        Logger.error('Error checking existing credentials:', 'GmailCredentialsService', selectError as Error);
        Logger.error(`Select error code: ${selectError.code}`, 'GmailCredentialsService');
        Logger.error(`Select error message: ${selectError.message}`, 'GmailCredentialsService');
        
        if (selectError.code === 'PGRST116') {
          Logger.info('No existing credentials found, will insert new ones', 'GmailCredentialsService');
        } else {
          throw new Error(`Failed to check existing Gmail credentials: ${selectError.message}`);
        }
      }

      if (existing) {
        Logger.info('Updating existing credentials...', 'GmailCredentialsService');
        // Update existing credentials
        const { error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
            scope: credentials.scope,
            token_type: credentials.token_type,
            expiry_date: credentials.expiry_date,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          Logger.error('Error updating Gmail credentials:', 'GmailCredentialsService', error as Error);
          throw new Error(`Failed to update Gmail credentials: ${error.message}`);
        }

        Logger.info('Gmail credentials updated for user:', 'GmailCredentialsService');
      } else {
        Logger.info('Inserting new credentials...', 'GmailCredentialsService');
        // Insert new credentials
        const { error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            user_id: userId,
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
            scope: credentials.scope,
            token_type: credentials.token_type,
            expiry_date: credentials.expiry_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          Logger.error('Error storing Gmail credentials:', 'GmailCredentialsService', error as Error);
          Logger.error(`Insert error code: ${error.code}`, 'GmailCredentialsService');
          Logger.error(`Insert error message: ${error.message}`, 'GmailCredentialsService');
          throw new Error(`Failed to store Gmail credentials: ${error.message}`);
        }

        Logger.info('Gmail credentials stored for user:', 'GmailCredentialsService');
      }
    } catch (error) {
      Logger.error('Error in storeCredentials:', 'GmailCredentialsService', error as Error);
      throw error;
    }
  }

  /**
   * Retrieve Gmail credentials for a user
   */
  static async getCredentials(userId: string): Promise<GmailCredentials | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No credentials found
          return null;
        }
        Logger.error('Error retrieving Gmail credentials:', 'GmailCredentialsService', error as Error);
        throw new Error('Failed to retrieve Gmail credentials');
      }

      if (!data) {
        return null;
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        scope: data.scope,
        token_type: data.token_type,
        expiry_date: data.expiry_date
      };
    } catch (error) {
      Logger.error('Error in getCredentials:', 'GmailCredentialsService', error as Error);
      throw error;
    }
  }

  /**
   * Delete Gmail credentials for a user
   */
  static async deleteCredentials(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('user_id', userId);

      if (error) {
        Logger.error('Error deleting Gmail credentials:', 'GmailCredentialsService', error as Error);
        throw new Error('Failed to delete Gmail credentials');
      }

      Logger.info('Gmail credentials deleted for user:', 'GmailCredentialsService');
    } catch (error) {
      Logger.error('Error in deleteCredentials:', 'GmailCredentialsService', error as Error);
      throw error;
    }
  }

  /**
   * Check if user has Gmail credentials
   */
  static async hasCredentials(userId: string): Promise<boolean> {
    try {
      const credentials = await this.getCredentials(userId);
      return credentials !== null;
    } catch (error) {
      Logger.error('Error checking Gmail credentials:', 'GmailCredentialsService', error as Error);
      return false;
    }
  }

  /**
   * Update access token (for token refresh)
   */
  static async updateAccessToken(userId: string, accessToken: string, expiryDate: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          access_token: accessToken,
          expiry_date: expiryDate,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        Logger.error('Error updating access token:', 'GmailCredentialsService', error as Error);
        throw new Error('Failed to update access token');
      }

      Logger.info('Access token updated for user:', 'GmailCredentialsService');
    } catch (error) {
      Logger.error('Error in updateAccessToken:', 'GmailCredentialsService', error as Error);
      throw error;
    }
  }
} 