import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from '../utils/logger';
import { config } from '../config/environment';
import { GmailCredentialsService } from './gmailCredentialsService';

export interface GmailCredentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface DraftEmail {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.gmail.clientId,
      config.gmail.clientSecret,
      config.gmail.redirectUri
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  // Generate OAuth2 authorization URL
  generateAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId // Pass user ID in state parameter
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string): Promise<GmailCredentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to get access and refresh tokens');
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope || '',
        token_type: tokens.token_type || 'Bearer',
        expiry_date: tokens.expiry_date || 0
      };
    } catch (error) {
      Logger.error('Error getting tokens from code:', 'GmailService', error as Error);
      throw new Error('Failed to authenticate with Gmail');
    }
  }

  // Set credentials for API calls
  setCredentials(credentials: GmailCredentials): void {
    this.oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      scope: credentials.scope,
      token_type: credentials.token_type,
      expiry_date: credentials.expiry_date
    });
  }

  // Refresh access token if needed
  async refreshAccessToken(refreshToken: string, userId?: string): Promise<string> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }

      // Update stored credentials if userId is provided
      if (userId && credentials.expiry_date) {
        await GmailCredentialsService.updateAccessToken(userId, credentials.access_token, credentials.expiry_date);
      }

      return credentials.access_token;
    } catch (error) {
      Logger.error('Error refreshing access token:', 'GmailService', error as Error);
      throw new Error('Failed to refresh Gmail access token');
    }
  }

  // Get credentials for a user and set them up
  async setupCredentialsForUser(userId: string): Promise<boolean> {
    try {
      const credentials = await GmailCredentialsService.getCredentials(userId);
      
      if (!credentials) {
        Logger.info('No Gmail credentials found for user:', 'GmailService');
        return false;
      }

      // Check if token is expired and refresh if needed
      if (credentials.expiry_date && Date.now() >= credentials.expiry_date) {
        Logger.info('Gmail token expired, refreshing...', 'GmailService');
        const newAccessToken = await this.refreshAccessToken(credentials.refresh_token, userId);
        
        // Update credentials with new token
        credentials.access_token = newAccessToken;
        credentials.expiry_date = Date.now() + (3600 * 1000); // 1 hour from now
      }

      this.setCredentials(credentials);
      Logger.info('Gmail credentials set up successfully for user:', 'GmailService');
      return true;
    } catch (error) {
      Logger.error('Error setting up credentials for user:', 'GmailService', error as Error);
      return false;
    }
  }

  // Create a draft email
  async createDraft(draftEmail: DraftEmail): Promise<string> {
    try {
      // Create email message
      const message = this.createEmailMessage(draftEmail);
      
      Logger.info('Creating draft with message:', 'GmailService');
      
      // Create draft
      const response = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: message
          }
        }
      });

      Logger.info('Draft created successfully:', 'GmailService');
      return response.data.id;
    } catch (error: any) {
      Logger.error('Error creating draft:', 'GmailService', error as Error);
      
      // Log detailed error information
      if (error.response) {
        Logger.error(`Gmail API Error: ${error.response.status} - ${error.response.statusText}`, 'GmailService');
        Logger.error(`Error details: ${JSON.stringify(error.response.data)}`, 'GmailService');
        throw new Error(`Gmail API Error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
      } else if (error.message) {
        throw new Error(`Gmail Error: ${error.message}`);
      } else {
        throw new Error('Failed to create Gmail draft - Unknown error');
      }
    }
  }

  // Create email message in base64 format
  private createEmailMessage(draftEmail: DraftEmail): string {
    try {
      // Validate required fields
      if (!draftEmail.to || !draftEmail.subject || !draftEmail.body) {
        throw new Error('To, subject, and body are required');
      }

      const emailLines = [
        `To: ${draftEmail.to}`,
        `Subject: ${draftEmail.subject}`,
        `Content-Type: text/html; charset=utf-8`,
        `MIME-Version: 1.0`,
        ''
      ];

      // Add CC if provided
      if (draftEmail.cc) {
        emailLines.splice(2, 0, `Cc: ${draftEmail.cc}`);
      }

      // Add BCC if provided
      if (draftEmail.bcc) {
        emailLines.splice(2, 0, `Bcc: ${draftEmail.bcc}`);
      }

      // Add email body
      emailLines.push(draftEmail.body);

      const email = emailLines.join('\r\n');
      const base64Message = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      Logger.info(`Email message created successfully (${base64Message.length} chars)`, 'GmailService');
      return base64Message;
    } catch (error) {
      Logger.error('Error creating email message:', 'GmailService', error as Error);
      throw new Error(`Failed to create email message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user's Gmail profile
  async getProfile(): Promise<any> {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me'
      });

      return response.data;
    } catch (error) {
      Logger.error('Error getting Gmail profile:', 'GmailService', error as Error);
      throw new Error('Failed to get Gmail profile');
    }
  }

  // List drafts
  async listDrafts(maxResults: number = 10): Promise<any[]> {
    try {
      const response = await this.gmail.users.drafts.list({
        userId: 'me',
        maxResults
      });

      return response.data.drafts || [];
    } catch (error) {
      Logger.error('Error listing drafts:', 'GmailService', error as Error);
      throw new Error('Failed to list Gmail drafts');
    }
  }
}

export const gmailService = new GmailService(); 