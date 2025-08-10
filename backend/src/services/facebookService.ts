/**
 * 📘 FACEBOOK SERVICE
 * 
 * Handles all Facebook API operations including:
 * - User authentication
 * - Page management
 * - Posting content
 */

import { config } from '../config/environment';
import { FacebookPage, FacebookPost, FacebookPostResponse, FacebookAuthResponse, FacebookApiPage, FacebookMediaUploadResponse } from '../models/facebookTypes';
import { supabase } from '../config/database';
import { Logger } from '../utils/logger';

export class FacebookService {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;
  private apiVersion: string;

  constructor() {
    this.appId = config.facebook.appId; 
    this.appSecret = config.facebook.appSecret;
    this.redirectUri = config.facebook.redirectUri;
    this.apiVersion = config.facebook.apiVersion;
  }

  /**
   * Get Facebook OAuth URL for user authentication
   * Note: Facebook has strict permission requirements.
   * We need these three permissions to properly access and manage pages:
   * - pages_show_list: List user's pages
   * - pages_read_engagement: Read page engagement data and get page access tokens
   * - pages_manage_posts: Manage page posts (for future posting functionality)
   */
  getAuthUrl(state?: string, jwtToken?: string): string {
    const baseUrl = `https://www.facebook.com/${this.apiVersion}/dialog/oauth`;
    
    // Encode JWT token in state parameter if provided
    let stateParam = state || 'default';
    if (jwtToken) {
      stateParam = `${stateParam}|${jwtToken}`;
    }
    
    console.log('--- Facebook Service Debug ---');
    console.log('Original State:', state);
    console.log('JWT Token:', jwtToken ? jwtToken.substring(0, 20) + '...' : 'null');
    console.log('Final State Param:', stateParam);
    
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      // Request comprehensive scopes needed for full page access including posts
      // pages_show_list: List user's pages
      // pages_read_engagement: Read page engagement data and get page access tokens  
      // pages_manage_posts: Create, edit and delete posts (requires app review)
      // pages_read_user_content: Read user-generated content on pages
      // business_management: Access to business manager data
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,business_management',
      response_type: 'code',
      state: stateParam,
      auth_type: 'rerequest'
    });

    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('Final Auth URL:', finalUrl);
    
    return finalUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{ access_token: string; user_id: string }> {
    try {
      const tokenUrl = `https://graph.facebook.com/${this.apiVersion}/oauth/access_token`;
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: this.redirectUri,
        code: code
      });

      const response = await fetch(`${tokenUrl}?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook token exchange failed: ${data.error.message}`);
      }

      return {
        access_token: data.access_token,
        user_id: data.user_id
      };
    } catch (error) {
      Logger.error('Error exchanging Facebook code for token:', 'FacebookService', error as Error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * Get user's Facebook pages
   */
  async getUserPages(accessToken: string): Promise<FacebookApiPage[]> {
    try {
      const accountsUrl = `https://graph.facebook.com/${this.apiVersion}/me/accounts`;
      const baseParams = new URLSearchParams({
        access_token: accessToken,
        fields: 'id,name,access_token'
      });

      console.log('🚀 === FACEBOOK GET USER PAGES START ===');
      console.log('Access token length:', accessToken ? accessToken.length : 'null');
      console.log('📡 Requesting managed pages list...');
      console.log('URL:', accountsUrl);
      console.log('Fields requested:', 'id,name,access_token');
      console.log('Full URL with params:', `${accountsUrl}?${baseParams.toString()}`);

      const accountsResp = await fetch(`${accountsUrl}?${baseParams.toString()}`);
      console.log('📥 Accounts response status:', accountsResp.status);
      const accountsData = await accountsResp.json();
      console.log('📋 Accounts Response:', JSON.stringify(accountsData, null, 2));

      if (accountsData.error) {
        console.error('Facebook API Error (accounts):', accountsData.error);
        throw new Error(`Failed to fetch Facebook pages: ${accountsData.error.message}`);
      }

      if (!accountsData.data || !Array.isArray(accountsData.data)) {
        console.error('❌ Unexpected accounts response structure:', accountsData);
        throw new Error('Invalid response structure from Facebook API');
      }

      console.log(`✅ Facebook API returned ${accountsData.data.length} managed pages`);

      // For each page, fetch details using the PAGE access token to ensure fields are present
      const detailedPages: FacebookApiPage[] = await Promise.all(
        accountsData.data.map(async (acct: any, index: number) => {
          const pageId = acct.id;
          const pageAccessToken = acct.access_token;
          console.log(`🔎 Fetching details for page ${index + 1} (${pageId})`);

          const pageUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}`;
          const pageParams = new URLSearchParams({
            access_token: pageAccessToken,
            // Fetch robust set of fields with explicit picture URL
            fields: 'id,name,category,fan_count,picture{url}'
          });

          const pageResp = await fetch(`${pageUrl}?${pageParams.toString()}`);
          console.log(`📥 Page ${pageId} response status:`, pageResp.status);
          const pageData = await pageResp.json();
          console.log(`📋 Page ${pageId} data:`, JSON.stringify(pageData, null, 2));

          if (pageData.error) {
            console.warn(`⚠️ Failed to fetch details for page ${pageId}:`, pageData.error);
            // Fall back to whatever we have from accounts edge
            return {
              id: pageId,
              name: acct.name || null,
              access_token: pageAccessToken,
              category: null as any,
              fan_count: null as any,
              picture: null as any
            } as unknown as FacebookApiPage;
          }

          const pictureUrl = (pageData.picture && pageData.picture.url)
            ? pageData.picture.url
            : (pageData.picture && pageData.picture.data && pageData.picture.data.url)
              ? pageData.picture.data.url
              : null;

          return {
            id: pageData.id || pageId,
            name: pageData.name || acct.name,
            access_token: pageAccessToken,
            category: pageData.category || null,
            fan_count: pageData.fan_count || null,
            picture: pictureUrl
          } as unknown as FacebookApiPage;
        })
      );

      console.log('🎯 Final processed pages:', detailedPages);
      console.log('=== FACEBOOK GET USER PAGES END ===');
      return detailedPages;
    } catch (error) {
      console.error('💥 Error in getUserPages:', error);
      Logger.error('Error fetching Facebook pages:', 'FacebookService', error as Error);
      throw new Error('Failed to fetch Facebook pages');
    }
  }

  /**
   * Save Facebook page connection to database
   */
  async savePageConnection(page: FacebookApiPage, userId: string): Promise<FacebookPage> {
    try {
      console.log('💾 === SAVE PAGE CONNECTION START ===');
      console.log('📄 Page data to save:', {
        facebook_page_id: page.id,
        name: page.name,
        category: page.category,
        fan_count: page.fan_count,
        picture: page.picture || null,
        user_id: userId
      });
      console.log('🔑 Access token length:', page.access_token ? page.access_token.length : 'null');
      console.log('🌐 Supabase URL:', config.supabase.url);
      console.log('🔑 Service role key exists:', !!config.supabase.serviceRoleKey);
      
      const { data, error } = await supabase
        .from('facebook_pages')
        .upsert({
          facebook_page_id: page.id,
          name: page.name,
          access_token: page.access_token,
          category: page.category,
          fan_count: page.fan_count,
          picture: page.picture || null,
          user_id: userId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'facebook_page_id' })
        .select()
        .single();

      console.log('📊 Supabase upsert response:', { data, error });

      if (error) {
        console.log('❌ Supabase error details:');
        console.log('  Error code:', error.code);
        console.log('  Error message:', error.message);
        console.log('  Error details:', error.details);
        console.log('  Error hint:', error.hint);
        console.log('🔍 Data being saved:');
        console.log('  facebook_page_id:', page.id);
        console.log('  name:', page.name);
        console.log('  access_token length:', page.access_token ? page.access_token.length : 'null');
        console.log('  user_id:', userId);
        console.log('  user_id type:', typeof userId);
        console.log('  user_id length:', userId ? userId.length : 'null');
        
        Logger.error(`Error saving Facebook page connection: ${error.code} - ${error.message}`, 'FacebookService');
        throw new Error(`Failed to save Facebook page connection: ${error.message}`);
      }

      console.log('✅ Page saved successfully to database');
      console.log('=== SAVE PAGE CONNECTION END ===');
      return {
        id: data.id,
        facebook_page_id: data.facebook_page_id,
        name: data.name,
        access_token: data.access_token,
        category: data.category,
        fan_count: data.fan_count,
        picture: data.picture,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.log('Exception in savePageConnection:', error);
      Logger.error('Error saving Facebook page connection:', 'FacebookService');
      throw new Error('Failed to save Facebook page connection');
    }
  }

  /**
   * Get user's connected Facebook pages from database
   */
  async getUserConnectedPages(userId: string): Promise<FacebookPage[]> {
    try {
      console.log('--- Facebook Service getUserConnectedPages Debug ---');
      console.log('User ID:', userId);
      console.log('Supabase URL:', config.supabase.url);
      console.log('Service Role Key exists:', !!config.supabase.serviceRoleKey);
      
      const { data, error } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('user_id', userId);

      console.log('Supabase response data:', data);
      console.log('Supabase response error:', error);

      if (error) {
        Logger.error('Error fetching user Facebook pages:', 'FacebookService', error);
        throw new Error(`Failed to fetch user Facebook pages: ${error.message}`);
      }

      const mappedData = data.map(page => ({
        id: page.id,
        facebook_page_id: page.facebook_page_id,
        name: page.name,
        access_token: page.access_token,
        category: page.category,
        fan_count: page.fan_count,
        picture: page.picture,
        user_id: page.user_id,
        created_at: page.created_at,
        updated_at: page.updated_at
      }));

      console.log('Mapped data:', mappedData);
      return mappedData;
    } catch (error) {
      console.log('--- Facebook Service getUserConnectedPages Error ---');
      console.log('Error type:', typeof error);
      console.log('Error message:', error instanceof Error ? error.message : error);
      console.log('Full error:', error);
      
      Logger.error('Error fetching user Facebook pages:', 'FacebookService', error as Error);
      throw new Error('Failed to fetch user Facebook pages');
    }
  }

  /**
   * Upload media (image/video) to Facebook
   */
  async uploadMedia(pageId: string, pageAccessToken: string, mediaUrl: string, mediaType: 'image' | 'video' = 'image'): Promise<FacebookMediaUploadResponse> {
    try {
      console.log('🚀 === FACEBOOK MEDIA UPLOAD START ===');
      console.log('Page ID:', pageId);
      console.log('Media URL:', mediaUrl);
      console.log('Media Type:', mediaType);

      const uploadUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}/${mediaType}s`;
      const uploadData = new URLSearchParams({
        access_token: pageAccessToken,
        url: mediaUrl,
        published: 'false' // Upload but don't publish immediately
      });

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: uploadData.toString()
      });

      const data = await response.json();
      console.log('📋 Media Upload Response:', JSON.stringify(data, null, 2));

      if (data.error) {
        console.error('Facebook media upload error:', data.error);
        return {
          id: '',
          success: false,
          message: `Failed to upload media: ${data.error.message}`
        };
      }

      console.log('✅ Media uploaded successfully:', data.id);
      console.log('=== FACEBOOK MEDIA UPLOAD END ===');
      
      return {
        id: data.id,
        success: true,
        message: 'Media uploaded successfully'
      };
    } catch (error) {
      console.error('💥 Error in uploadMedia:', error);
      Logger.error('Error uploading media to Facebook:', 'FacebookService', error as Error);
      return {
        id: '',
        success: false,
        message: 'Failed to upload media to Facebook'
      };
    }
  }

  /**
   * Post content to a Facebook page with enhanced functionality
   * Supports text, links, images, and scheduling
   */
  async postToPage(pageId: string, pageAccessToken: string, post: FacebookPost): Promise<FacebookPostResponse> {
    try {
      console.log('🚀 === FACEBOOK POST START ===');
      console.log('Page ID:', pageId);
      console.log('Post data:', {
        message: post.message ? post.message.substring(0, 100) + (post.message.length > 100 ? '...' : '') : null,
        link: post.link,
        image_url: post.image_url,
        scheduled_publish_time: post.scheduled_publish_time,
        published: post.published
      });

      // Determine post endpoint and method based on content type
      let postUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}/feed`;
      let postData: any = {
        access_token: pageAccessToken,
        published: post.published !== false ? 'true' : 'false'
      };

      // Handle text content
      if (post.message) {
        postData.message = post.message;
      }

      // Handle link sharing
      if (post.link) {
        postData.link = post.link;
      }

      // Handle image posting
      if (post.image_url) {
        // For images, we need to use the photos endpoint
        postUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}/photos`;
        postData.url = post.image_url;
        postData.caption = post.message || '';
        delete postData.message; // Use caption instead of message for photos
      }

      // Handle scheduled posts
      if (post.scheduled_publish_time) {
        postData.scheduled_publish_time = post.scheduled_publish_time;
        postData.published = 'false'; // Scheduled posts can't be published immediately
      }

      console.log('📡 Posting to URL:', postUrl);
      console.log('📋 Post data:', postData);

      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(postData).toString()
      });

      const data = await response.json();
      console.log('📥 Facebook API Response:', JSON.stringify(data, null, 2));

      if (data.error) {
        console.error('Facebook post error:', data.error);
        Logger.error('Facebook post error:', 'FacebookService', data.error);
        return {
          id: '',
          success: false,
          message: `Failed to post: ${data.error.message} (Code: ${data.error.code})`
        };
      }

      const postId = data.id || data.post_id;
      console.log('✅ Post created successfully:', postId);
      console.log('=== FACEBOOK POST END ===');

      return {
        id: postId,
        success: true,
        message: post.scheduled_publish_time ? 'Post scheduled successfully' : 'Post published successfully'
      };
    } catch (error) {
      console.error('💥 Error in postToPage:', error);
      Logger.error('Error posting to Facebook page:', 'FacebookService', error as Error);
      return {
        id: '',
        success: false,
        message: 'Failed to post to Facebook page'
      };
    }
  }

  /**
   * Create a more complex post with media and enhanced options
   */
  async createEnhancedPost(
    pageId: string, 
    pageAccessToken: string, 
    options: {
      message?: string;
      link?: string;
      imageUrl?: string;
      scheduledTime?: Date;
      published?: boolean;
      tags?: string[];
    }
  ): Promise<FacebookPostResponse> {
    try {
      console.log('🚀 === FACEBOOK ENHANCED POST START ===');
      
      const post: FacebookPost = {
        message: options.message,
        link: options.link,
        image_url: options.imageUrl,
        published: options.published !== false,
        scheduled_publish_time: options.scheduledTime ? Math.floor(options.scheduledTime.getTime() / 1000) : undefined
      };

      // Add hashtags to message if provided
      if (options.tags && options.tags.length > 0) {
        const hashtags = options.tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
        post.message = post.message ? `${post.message}\n\n${hashtags}` : hashtags;
      }

      return await this.postToPage(pageId, pageAccessToken, post);
    } catch (error) {
      Logger.error('Error creating enhanced Facebook post:', 'FacebookService', error as Error);
      return {
        id: '',
        success: false,
        message: 'Failed to create enhanced post'
      };
    }
  }

  /**
   * Check if posting to pages is available for this app
   */
  async checkPostingAvailability(pageId: string, pageAccessToken: string): Promise<{ available: boolean; message: string }> {
    try {
      const testUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}?fields=id,name,access_token&access_token=${pageAccessToken}`;
      const response = await fetch(testUrl);
      const data = await response.json();

      if (data.error) {
        return {
          available: false,
          message: `Page access error: ${data.error.message}`
        };
      }

      // Check if we have the necessary permissions for posting
      // This is a basic check - actual posting permissions require app review
      return {
        available: true,
        message: 'Page access confirmed. Note: Posting may require app review.'
      };
    } catch (error) {
      return {
        available: false,
        message: 'Unable to verify page access'
      };
    }
  }

  /**
   * Delete a Facebook page connection
   */
  async deletePageConnection(pageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('facebook_pages')
        .delete()
        .eq('id', pageId)
        .eq('user_id', userId);

      if (error) {
        Logger.error('Error deleting Facebook page connection:', 'FacebookService', error);
        throw new Error('Failed to delete Facebook page connection');
      }

      return true;
    } catch (error) {
      Logger.error('Error deleting Facebook page connection:', 'FacebookService', error as Error);
      throw new Error('Failed to delete Facebook page connection');
    }
  }

  /**
   * Get posts from a Facebook page
   */
  async getPagePosts(pageId: string, pageAccessToken: string, limit: number = 25): Promise<any[]> {
    try {
      const postsUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}/posts`;
      const params = new URLSearchParams({
        access_token: pageAccessToken,
        fields: 'id,message,story,created_time,updated_time,type,status_type,permalink_url,full_picture,attachments{media,target,url},reactions.summary(true),comments.summary(true),shares',
        limit: limit.toString()
      });

      console.log('🚀 === FACEBOOK GET PAGE POSTS START ===');
      console.log('Page ID:', pageId);
      console.log('Limit:', limit);
      console.log('URL:', postsUrl);
      console.log('Full URL with params:', `${postsUrl}?${params.toString()}`);

      const response = await fetch(`${postsUrl}?${params.toString()}`);
      console.log('📥 Posts response status:', response.status);
      const data = await response.json();
      console.log('📋 Posts Response:', JSON.stringify(data, null, 2));

      if (data.error) {
        console.error('Facebook API Error (posts):', data.error);
        throw new Error(`Failed to fetch Facebook page posts: ${data.error.message}`);
      }

      if (!data.data || !Array.isArray(data.data)) {
        console.error('❌ Unexpected posts response structure:', data);
        return [];
      }

      console.log(`✅ Facebook API returned ${data.data.length} posts`);
      console.log('=== FACEBOOK GET PAGE POSTS END ===');
      return data.data;
    } catch (error) {
      console.error('💥 Error in getPagePosts:', error);
      Logger.error('Error fetching Facebook page posts:', 'FacebookService', error as Error);
      throw new Error('Failed to fetch Facebook page posts');
    }
  }

  /**
   * Debug helper: Fetch raw data from Facebook to inspect structure
   */
  async inspectRaw(userAccessToken: string): Promise<any> {
    const accountsUrl = `https://graph.facebook.com/${this.apiVersion}/me/accounts`;
    const baseParams = new URLSearchParams({
      access_token: userAccessToken,
      fields: 'id,name,access_token'
    });

    const accountsResp = await fetch(`${accountsUrl}?${baseParams.toString()}`);
    const accountsData = await accountsResp.json();

    const pagesRaw: any[] = [];
    if (accountsData && Array.isArray(accountsData.data)) {
      for (const acct of accountsData.data) {
        const pageId = acct.id;
        const pageAccessToken = acct.access_token;
        const pageUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}`;
        const pageParams = new URLSearchParams({
          access_token: pageAccessToken,
          fields: 'id,name,category,fan_count,picture{url}'
        });
        const pr = await fetch(`${pageUrl}?${pageParams.toString()}`);
        const pd = await pr.json();
        pagesRaw.push({ pageId, detail: pd });
      }
    }

    return {
      accounts: accountsData,
      pages: pagesRaw
    };
  }
} 