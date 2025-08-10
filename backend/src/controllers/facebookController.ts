/**
 * 📘 FACEBOOK CONTROLLER
 * 
 * Handles all Facebook-related HTTP requests including:
 * - Authentication
 * - Page management
 * - Posting content
 */

import { Request, Response } from 'express';
import { FacebookService } from '../services/facebookService';
import { FacebookPost, FacebookPageConnection, FacebookPage } from '../models/facebookTypes';
import { Logger } from '../utils/logger';
import { ResponseHelper } from '../utils/responseHelper';

export class FacebookController {
  private facebookService: FacebookService;

  constructor() {
    this.facebookService = new FacebookService();
  }

  /**
   * Get Facebook OAuth URL for user authentication
   */
  getAuthUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const state = req.query.state as string;
      const authHeader = req.headers.authorization;
      const jwtToken = authHeader && authHeader.split(' ')[1];
      
      console.log('--- Facebook Auth URL Debug ---');
      console.log('State:', state);
      console.log('Auth Header:', authHeader);
      console.log('JWT Token:', jwtToken ? jwtToken.substring(0, 20) + '...' : 'null');
      
      const authUrl = this.facebookService.getAuthUrl(state, jwtToken);
      
      console.log('Generated Auth URL:', authUrl);
      
      ResponseHelper.success(res, {
        authUrl,
        message: 'Facebook authentication URL generated successfully'
      });
    } catch (error) {
      Logger.error('Error generating Facebook auth URL:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to generate Facebook authentication URL', 500);
    }
  };

  /**
   * Handle Facebook OAuth callback and exchange code for token
   */
  handleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('=== FACEBOOK CALLBACK DEBUG ===');
      console.log('Query params:', req.query);
      console.log('Code:', req.query.code);
      console.log('State:', req.query.state);
      
      const { code, state } = req.query;
      
      if (!code) {
        console.log('ERROR: No authorization code received');
        ResponseHelper.error(res, 'Authorization code is required', 400);
        return;
      }

      console.log('Exchanging code for access token...');
      // Exchange code for access token
      const { access_token, user_id } = await this.facebookService.exchangeCodeForToken(code as string);
      console.log('Access token received, user_id:', user_id);
      
      console.log('Getting user Facebook pages...');
      // Get user's Facebook pages
      const pages = await this.facebookService.getUserPages(access_token);
      console.log('Facebook pages received:', pages.length, 'pages');
      
      // Extract user ID from state parameter (JWT token is encoded there)
      let userId: string | null = null;
      console.log('Extracting user ID from state parameter...');
      console.log('State value:', state);
      console.log('State type:', typeof state);
      
      // Decode URL-encoded state parameter if needed
      let decodedState: string | null = null;
      if (state && typeof state === 'string') {
        try {
          decodedState = decodeURIComponent(state);
          console.log('Decoded state:', decodedState);
        } catch (decodeError) {
          console.log('Failed to decode state parameter, using original:', decodeError);
          decodedState = state;
        }
      }
      
      if (decodedState && decodedState.includes('|')) {
        const jwtToken = decodedState.split('|')[1];
        console.log('JWT token extracted from state:', jwtToken ? jwtToken.substring(0, 20) + '...' : 'null');
        try {
          // Import JWT utils here to avoid circular dependency
          const { JWTUtils } = await import('../utils/jwt');
          const user = JWTUtils.verifyToken(jwtToken);
          userId = user.id;
          console.log('User ID extracted from JWT:', userId);
          console.log('User ID type:', typeof userId);
          console.log('User ID length:', userId ? userId.length : 'null');
          
          // Validate UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const isValidUUID = uuidRegex.test(userId);
          console.log('Is valid UUID format:', isValidUUID);
          
          if (!isValidUUID) {
            console.log('❌ INVALID UUID FORMAT - this will cause database save to fail');
            ResponseHelper.error(res, 'Invalid user ID format', 400);
            return;
          }
        } catch (jwtError) {
          console.log('JWT verification failed:', jwtError);
          Logger.error('Failed to extract user ID from state parameter:', 'FacebookController');
          ResponseHelper.error(res, 'Invalid state parameter', 400);
          return;
        }
      } else {
        console.log('State parameter format issue - no JWT token found');
        console.log('Decoded state:', decodedState);
        console.log('Contains pipe separator:', decodedState && decodedState.includes('|'));
      }
      
      if (!userId) {
        console.log('ERROR: User ID not found in state parameter');
        ResponseHelper.error(res, 'User ID not found in state parameter', 400);
        return;
      }

      console.log('Saving page connections to database...');
      // Save page connections to database
      const savedPages: FacebookPage[] = [];
      for (const page of pages) {
        try {
          console.log('Saving page:', page.name, 'with ID:', page.id);
          const savedPage = await this.facebookService.savePageConnection(page, userId);
          console.log('Page saved successfully:', savedPage.id);
          savedPages.push(savedPage);
        } catch (error) {
          console.log('Failed to save page:', page.name, 'Error:', error);
          console.log('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : 'No stack trace',
            pageData: {
              id: page.id,
              name: page.name,
              access_token: page.access_token ? 'Present (' + page.access_token.length + ' chars)' : 'Missing'
            }
          });
          Logger.error(`Failed to save page connection for page ${page.id}: ${error instanceof Error ? error.message : String(error)}`, 'FacebookController');
        }
      }

      console.log('All pages processed. Saved pages count:', savedPages.length);
      ResponseHelper.success(res, {
        message: 'Facebook authentication successful',
        pages: savedPages,
        access_token: access_token
      });
    } catch (error) {
      console.log('ERROR in Facebook callback:', error);
      Logger.error('Error handling Facebook callback:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to complete Facebook authentication', 500);
    }
  };

  /**
   * Get user's connected Facebook pages
   */
  getUserPages = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      console.log('--- Facebook Controller getUserPages Debug ---');
      console.log('User ID:', userId);

      const pages = await this.facebookService.getUserConnectedPages(userId);
      
      console.log('Retrieved pages:', pages);
      
      ResponseHelper.success(res, {
        pages,
        message: 'Facebook pages retrieved successfully'
      });
    } catch (error) {
      console.log('--- Facebook Controller getUserPages Error ---');
      console.log('Error:', error);
      
      Logger.error('Error fetching user Facebook pages:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to fetch Facebook pages', 500);
    }
  };

  /**
   * Get Facebook connection status for the user
   */
  getConnectionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      console.log('--- Facebook Controller getConnectionStatus Debug ---');
      console.log('User ID:', userId);

      const pages = await this.facebookService.getUserConnectedPages(userId);
      
      const isConnected = pages.length > 0;
      const pageCount = pages.length;
      
      console.log('Connection status:', { isConnected, pageCount });
      
      ResponseHelper.success(res, {
        isConnected,
        pageCount,
        pages: pages.map(page => ({
          id: page.id,
          name: page.name,
          facebook_page_id: page.facebook_page_id,
          category: page.category,
          fan_count: page.fan_count,
          picture: page.picture
        })),
        message: isConnected ? 'Facebook connected successfully' : 'No Facebook pages connected'
      });
    } catch (error) {
      console.log('--- Facebook Controller getConnectionStatus Error ---');
      console.log('Error:', error);
      
      Logger.error('Error checking Facebook connection status:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to check Facebook connection status', 500);
    }
  };

  /**
   * Post content to a Facebook page
   */
  postToPage = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      console.log('=== FACEBOOK POST REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('User ID:', userId);

      const { pageId, message, link, imageUrl, scheduledTime, published, tags } = req.body;

      console.log('Extracted fields:');
      console.log('  pageId:', pageId);
      console.log('  message:', message);
      console.log('  link:', link);
      console.log('  imageUrl:', imageUrl);
      console.log('  scheduledTime:', scheduledTime);
      console.log('  published:', published);
      console.log('  tags:', tags);

      // Validation
      if (!pageId) {
        ResponseHelper.error(res, 'Page ID is required', 400);
        return;
      }

      // More flexible validation - check for any content
      const hasMessage = message && message.trim().length > 0;
      const hasLink = link && link.trim().length > 0;
      const hasImageUrl = imageUrl && imageUrl.trim().length > 0;
      
      if (!hasMessage && !hasLink && !hasImageUrl) {
        console.log('❌ Validation failed - no content provided');
        console.log('  message exists:', !!message, 'value:', message, 'trimmed:', message?.trim(), 'hasMessage:', hasMessage);
        console.log('  link exists:', !!link, 'value:', link, 'trimmed:', link?.trim(), 'hasLink:', hasLink);
        console.log('  imageUrl exists:', !!imageUrl, 'value:', imageUrl, 'trimmed:', imageUrl?.trim(), 'hasImageUrl:', hasImageUrl);
        ResponseHelper.error(res, 'At least one of message, link, or image is required', 400);
        return;
      }

      // Verify user owns this page
      const userPages = await this.facebookService.getUserConnectedPages(userId);
      const targetPage = userPages.find(page => page.facebook_page_id === pageId);
      
      if (!targetPage) {
        ResponseHelper.error(res, 'Page not found or access denied', 404);
        return;
      }

      console.log('Target page found:', {
        id: targetPage.id,
        name: targetPage.name,
        facebook_page_id: targetPage.facebook_page_id
      });

      // Parse scheduled time if provided
      let scheduledUnixTime: number | undefined;
      if (scheduledTime) {
        const scheduledDate = new Date(scheduledTime);
        if (isNaN(scheduledDate.getTime())) {
          ResponseHelper.error(res, 'Invalid scheduled time format. Use ISO 8601 format.', 400);
          return;
        }
        
        // Check if scheduled time is in the future
        if (scheduledDate.getTime() <= Date.now()) {
          ResponseHelper.error(res, 'Scheduled time must be in the future', 400);
          return;
        }
        
        scheduledUnixTime = Math.floor(scheduledDate.getTime() / 1000);
      }

      console.log('🔍 Checking tags:', { tags, isArray: Array.isArray(tags), length: tags?.length });
      
      // Use enhanced posting method if tags are provided
      if (tags && Array.isArray(tags) && tags.length > 0) {
        console.log('🚀 Using enhanced posting method with tags');
        const result = await this.facebookService.createEnhancedPost(
          targetPage.facebook_page_id,
          targetPage.access_token,
          {
            message,
            link,
            imageUrl,
            scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
            published: published !== false,
            tags
          }
        );

        if (result.success) {
          ResponseHelper.success(res, {
            postId: result.id,
            message: result.message,
            scheduledTime: scheduledTime || null,
            tags: tags
          });
        } else {
          ResponseHelper.error(res, result.message || 'Failed to post to Facebook', 400);
        }
        return;
      }

      // Standard posting method
      console.log('🚀 Using standard posting method');
      const post: FacebookPost = {
        message,
        link,
        image_url: imageUrl,
        scheduled_publish_time: scheduledUnixTime,
        published: published !== false
      };

      const result = await this.facebookService.postToPage(
        targetPage.facebook_page_id,
        targetPage.access_token,
        post
      );

      if (result.success) {
        ResponseHelper.success(res, {
          postId: result.id,
          message: result.message,
          scheduledTime: scheduledTime || null,
          pageId: pageId,
          pageName: targetPage.name
        });
      } else {
        ResponseHelper.error(res, result.message || 'Failed to post to Facebook', 400);
      }
    } catch (error) {
      console.error('Error in postToPage:', error);
      Logger.error('Error posting to Facebook page:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to post to Facebook page', 500);
    }
  };

  /**
   * Upload media to Facebook page
   */
  uploadMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const { pageId, mediaUrl, mediaType } = req.body;

      if (!pageId) {
        ResponseHelper.error(res, 'Page ID is required', 400);
        return;
      }

      if (!mediaUrl) {
        ResponseHelper.error(res, 'Media URL is required', 400);
        return;
      }

      // Verify user owns this page
      const userPages = await this.facebookService.getUserConnectedPages(userId);
      const targetPage = userPages.find(page => page.facebook_page_id === pageId);
      
      if (!targetPage) {
        ResponseHelper.error(res, 'Page not found or access denied', 404);
        return;
      }

      const result = await this.facebookService.uploadMedia(
        targetPage.facebook_page_id,
        targetPage.access_token,
        mediaUrl,
        mediaType || 'image'
      );

      if (result.success) {
        ResponseHelper.success(res, {
          mediaId: result.id,
          message: result.message,
          mediaUrl: mediaUrl,
          mediaType: mediaType || 'image'
        });
      } else {
        ResponseHelper.error(res, result.message || 'Failed to upload media', 400);
      }
    } catch (error) {
      Logger.error('Error uploading media to Facebook:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to upload media to Facebook', 500);
    }
  };

  /**
   * Delete a Facebook page connection
   */
  deletePageConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const { pageId } = req.params;
      
      if (!pageId) {
        ResponseHelper.error(res, 'Page ID is required', 400);
        return;
      }

      const success = await this.facebookService.deletePageConnection(pageId, userId);
      
      if (success) {
        ResponseHelper.success(res, {
          message: 'Facebook page connection deleted successfully'
        });
      } else {
        ResponseHelper.error(res, 'Failed to delete page connection', 500);
      }
    } catch (error) {
      Logger.error('Error deleting Facebook page connection:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to delete page connection', 500);
    }
  };

  /**
   * Disconnect all Facebook pages for a user
   */
  disconnectAllPages = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Get all user's Facebook pages
      const userPages = await this.facebookService.getUserConnectedPages(userId);
      
      if (userPages.length === 0) {
        ResponseHelper.success(res, {
          message: 'No Facebook pages to disconnect'
        });
        return;
      }

      // Delete all page connections
      let deletedCount = 0;
      for (const page of userPages) {
        try {
          const success = await this.facebookService.deletePageConnection(page.id, userId);
          if (success) {
            deletedCount++;
          }
        } catch (error) {
          Logger.error(`Failed to delete page ${page.id}:`, 'FacebookController');
        }
      }

      ResponseHelper.success(res, {
        message: `Successfully disconnected ${deletedCount} Facebook page(s)`,
        deletedCount
      });
    } catch (error) {
      Logger.error('Error disconnecting all Facebook pages:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to disconnect Facebook pages', 500);
    }
  };

  /**
   * Check if posting to a specific page is available
   */
    checkPostingAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const { pageId } = req.params;
      
      if (!pageId) {
        ResponseHelper.error(res, 'Page ID is required', 400);
        return;
      }

      // Get user's pages to verify ownership
      const userPages = await this.facebookService.getUserConnectedPages(userId);
      const targetPage = userPages.find(page => page.id === pageId);
      
      if (!targetPage) {
        ResponseHelper.error(res, 'Page not found or access denied', 404);
        return;
      }

      // Check posting availability
      const availability = await this.facebookService.checkPostingAvailability(
        targetPage.facebook_page_id,
        targetPage.access_token
      );
      
      ResponseHelper.success(res, {
        available: availability.available,
        message: availability.message,
        pageId: pageId
      });
    } catch (error) {
      Logger.error('Error checking posting availability:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to check posting availability', 500);
    }
  };

  /**
   * Refresh Facebook page data (update fan count, etc.)
   */
  refreshPageData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const { pageId } = req.params;
      
      if (!pageId) {
        ResponseHelper.error(res, 'Page ID is required', 400);
        return;
      }

      // Get user's pages to verify ownership
      const userPages = await this.facebookService.getUserConnectedPages(userId);
      const targetPage = userPages.find(page => page.id === pageId);
      
      if (!targetPage) {
        ResponseHelper.error(res, 'Page not found or access denied', 404);
        return;
      }

      // Get fresh page data from Facebook
      const freshPages = await this.facebookService.getUserPages(targetPage.access_token);
      const freshPage = freshPages.find(page => page.id === targetPage.facebook_page_id);
      
      if (freshPage) {
        // Update the page in database
        const updatedPage = await this.facebookService.savePageConnection(freshPage, userId);
        
        ResponseHelper.success(res, {
          page: updatedPage,
          message: 'Page data refreshed successfully'
        });
      } else {
        ResponseHelper.error(res, 'Failed to refresh page data', 500);
      }
    } catch (error) {
      Logger.error('Error refreshing Facebook page data:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to refresh page data', 500);
    }
  };

  /**
   * Get posts from a Facebook page
   */
  getPagePosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const { pageId } = req.params;
      const limit = parseInt(req.query.limit as string) || 25;
      
      if (!pageId) {
        ResponseHelper.error(res, 'Page ID is required', 400);
        return;
      }

      // Get user's pages to verify ownership
      const userPages = await this.facebookService.getUserConnectedPages(userId);
      const targetPage = userPages.find(page => page.id === pageId);
      
      if (!targetPage) {
        ResponseHelper.error(res, 'Page not found or access denied', 404);
        return;
      }

      // Get page posts
      const posts = await this.facebookService.getPagePosts(
        targetPage.facebook_page_id,
        targetPage.access_token,
        limit
      );
      
      ResponseHelper.success(res, {
        posts,
        pageId: pageId,
        pageName: targetPage.name,
        message: 'Page posts retrieved successfully'
      });
    } catch (error) {
      Logger.error('Error fetching Facebook page posts:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to fetch page posts', 500);
    }
  };

  /**
   * Debug: Inspect raw Facebook API responses for a given user access token
   */
  debugInspect = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const userAccessToken = req.query.user_access_token as string | undefined;
      if (!userAccessToken) {
        ResponseHelper.error(res, 'Missing user_access_token query parameter', 400);
        return;
      }

      const result = await this.facebookService.inspectRaw(userAccessToken);

      ResponseHelper.success(res, {
        message: 'Facebook raw data inspection successful',
        raw: result
      });
    } catch (error) {
      Logger.error('Error inspecting Facebook raw data:', 'FacebookController');
      ResponseHelper.error(res, 'Failed to inspect Facebook data', 500);
    }
  };
} 