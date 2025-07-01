import { Request, Response } from 'express';
import { gmailService, GmailCredentials, DraftEmail } from '../services/gmailService';
import { GmailCredentialsService } from '../services/gmailCredentialsService';
import { Logger } from '../utils/logger';
import { ResponseHelper } from '../utils/responseHelper';

export class GmailController {
  // Generate OAuth2 authorization URL
  static async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const authUrl = gmailService.generateAuthUrl(userId);
      
      Logger.info('Gmail OAuth URL generated for user:', 'GmailController');
      
      ResponseHelper.success(res, {
        authUrl,
        message: 'Gmail authorization URL generated successfully'
      });
    } catch (error) {
      Logger.error('Error generating Gmail auth URL:', 'GmailController', error as Error);
      ResponseHelper.error(res, 'Failed to generate Gmail authorization URL', 500);
    }
  }

  // Handle OAuth2 callback
  static async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;

      Logger.info(`Gmail callback received - code: ${code ? 'present' : 'missing'}, state: ${state}`, 'GmailController');

      if (!code || typeof code !== 'string') {
        ResponseHelper.error(res, 'Authorization code is required', 400);
        return;
      }

      // Extract user ID from state parameter
      const userId = state as string;
      if (!userId) {
        ResponseHelper.error(res, 'User ID is required', 400);
        return;
      }

      Logger.info(`Processing Gmail callback for user: ${userId}`, 'GmailController');

      // Validate that the user ID is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        Logger.error(`Invalid user ID format: ${userId}`, 'GmailController');
        ResponseHelper.error(res, 'Invalid user ID format', 400);
        return;
      }

      Logger.info('Getting tokens from authorization code...', 'GmailController');
      const credentials = await gmailService.getTokensFromCode(code);
      
      Logger.info('Storing credentials in database...', 'GmailController');
      // Store credentials in database
      await GmailCredentialsService.storeCredentials(userId, credentials);
      
      Logger.info('Gmail OAuth completed and credentials stored', 'GmailController');
      
      ResponseHelper.success(res, {
        message: 'Gmail connected successfully',
        userId
      });
    } catch (error) {
      Logger.error('Error handling Gmail callback:', 'GmailController', error as Error);
      ResponseHelper.error(res, 'Failed to complete Gmail authentication', 500);
    }
  }

  // Create a draft email
  static async createDraft(req: Request, res: Response): Promise<void> {
    try {
      const { to, subject, body, cc, bcc } = req.body;
      const userId = req.body.userId || req.user?.id;

      // Validate required fields
      if (!to || !subject || !body) {
        ResponseHelper.error(res, 'To, subject, and body are required', 400);
        return;
      }

      if (!userId) {
        ResponseHelper.error(res, 'User ID is required', 400);
        return;
      }

      // Setup credentials for user
      const hasCredentials = await gmailService.setupCredentialsForUser(userId);
      if (!hasCredentials) {
        ResponseHelper.error(res, 'Gmail not connected. Please connect your Gmail account first.', 400);
        return;
      }

      // Create draft
      const draftEmail: DraftEmail = { to, subject, body, cc, bcc };
      const draftId = await gmailService.createDraft(draftEmail);

      Logger.info(`Draft created with ID: ${draftId}`, 'GmailController');
      
      ResponseHelper.success(res, {
        draftId,
        message: 'Draft created successfully'
      });
    } catch (error) {
      Logger.error('Error creating Gmail draft:', 'GmailController', error as Error);
      ResponseHelper.error(res, 'Failed to create Gmail draft', 500);
    }
  }

  // Get Gmail profile
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User ID is required', 400);
        return;
      }

      // Setup credentials for user
      const hasCredentials = await gmailService.setupCredentialsForUser(userId);
      if (!hasCredentials) {
        ResponseHelper.error(res, 'Gmail not connected. Please connect your Gmail account first.', 400);
        return;
      }

      // Get profile
      const profile = await gmailService.getProfile();

      Logger.info('Gmail profile retrieved successfully', 'GmailController');
      
      ResponseHelper.success(res, {
        profile,
        message: 'Gmail profile retrieved successfully'
      });
    } catch (error) {
      Logger.error('Error getting Gmail profile:', 'GmailController', error as Error);
      ResponseHelper.error(res, 'Failed to get Gmail profile', 500);
    }
  }

  // List drafts
  static async listDrafts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;
      const maxResults = parseInt(req.query.maxResults as string) || 10;

      if (!userId) {
        ResponseHelper.error(res, 'User ID is required', 400);
        return;
      }

      // Setup credentials for user
      const hasCredentials = await gmailService.setupCredentialsForUser(userId);
      if (!hasCredentials) {
        ResponseHelper.error(res, 'Gmail not connected. Please connect your Gmail account first.', 400);
        return;
      }

      // List drafts
      const drafts = await gmailService.listDrafts(maxResults);

      Logger.info(`Retrieved ${drafts.length} drafts`, 'GmailController');
      
      ResponseHelper.success(res, {
        drafts,
        count: drafts.length,
        message: 'Drafts retrieved successfully'
      });
    } catch (error) {
      Logger.error('Error listing Gmail drafts:', 'GmailController', error as Error);
      ResponseHelper.error(res, 'Failed to list Gmail drafts', 500);
    }
  }

  // Test Gmail connection
  static async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User ID is required', 400);
        return;
      }

      // Setup credentials for user
      const hasCredentials = await gmailService.setupCredentialsForUser(userId);
      if (!hasCredentials) {
        ResponseHelper.error(res, 'Gmail not connected. Please connect your Gmail account first.', 400);
        return;
      }

      // Test by getting profile
      const profile = await gmailService.getProfile();

      Logger.info('Gmail connection test successful', 'GmailController');
      
      ResponseHelper.success(res, {
        profile,
        message: 'Gmail connection is working'
      });
    } catch (error) {
      Logger.error('Error testing Gmail connection:', 'GmailController', error as Error);
      ResponseHelper.error(res, 'Failed to test Gmail connection', 500);
    }
  }

  // Check if user has Gmail connected
  static async checkConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User ID is required', 400);
        return;
      }

      const hasCredentials = await GmailCredentialsService.hasCredentials(userId);

      ResponseHelper.success(res, {
        connected: hasCredentials,
        message: hasCredentials ? 'Gmail is connected' : 'Gmail is not connected'
      });
    } catch (error) {
      Logger.error('Error checking Gmail connection:', 'GmailController', error as Error);
      ResponseHelper.error(res, 'Failed to check Gmail connection', 500);
    }
  }

  // Disconnect Gmail
  static async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User ID is required', 400);
        return;
      }

      await GmailCredentialsService.deleteCredentials(userId);

      Logger.info('Gmail disconnected for user:', 'GmailController');
      
      ResponseHelper.success(res, {
        message: 'Gmail disconnected successfully'
      });
    } catch (error) {
      Logger.error('Error disconnecting Gmail:', 'GmailController', error as Error);
      ResponseHelper.error(res, 'Failed to disconnect Gmail', 500);
    }
  }
} 