/**
 * 📘 FACEBOOK-RELATED TYPES
 * 
 * This file defines all Facebook API integration TypeScript interfaces
 */

/**
 * FacebookPage - Represents a Facebook page that a user has connected
 */
export interface FacebookPage {
  id: string;                    // Database record ID
  facebook_page_id: string;      // Facebook page ID from Facebook API
  name: string;                  // Page name
  access_token: string;          // Page access token
  category: string;              // Page category
  fan_count?: number;            // Number of page followers
  picture?: string;              // Page profile picture URL
  user_id: string;               // ID of the user who owns this connection
  created_at: string;            // When the connection was created
  updated_at: string;            // When the connection was last updated
}

/**
 * FacebookPost - Represents a post to be made on Facebook
 */
export interface FacebookPost {
  message?: string;              // Text content of the post
  link?: string;                 // URL to attach to the post
  image_url?: string;            // Image URL to attach
  scheduled_publish_time?: number; // Unix timestamp for scheduled posts
  published?: boolean;           // Whether to publish immediately (default: true)
}

/**
 * FacebookPostRequest - Enhanced request for creating Facebook posts
 */
export interface FacebookPostRequest {
  pageId: string;                // Internal page ID
  message?: string;              // Post text content
  link?: string;                 // Link to share
  image_url?: string;            // Image URL to attach
  image_file?: any;              // Image file upload (multer file object)
  scheduled_time?: string;       // ISO datetime string for scheduling
  published?: boolean;           // Publish immediately or save as draft
}

/**
 * FacebookMediaUploadResponse - Response from Facebook media upload
 */
export interface FacebookMediaUploadResponse {
  id: string;                    // Facebook media ID
  success: boolean;              // Upload success status
  message?: string;              // Error message if failed
}

/**
 * FacebookPostResponse - Response from Facebook after posting
 */
export interface FacebookPostResponse {
  id: string;                    // Facebook post ID
  success: boolean;              // Whether the post was successful
  message?: string;              // Error message if failed
}

/**
 * FacebookAuthRequest - Request to authenticate with Facebook
 */
export interface FacebookAuthRequest {
  code: string;                  // Authorization code from Facebook
  state?: string;                // State parameter for security
}

/**
 * FacebookAuthResponse - Response after Facebook authentication
 */
export interface FacebookAuthResponse {
  success: boolean;              // Whether authentication was successful
  message: string;               // Human-readable message
  pages?: FacebookPage[];        // List of user's Facebook pages
  access_token?: string;         // User access token
}

/**
 * FacebookPageConnection - Request to connect a specific page
 */
export interface FacebookPageConnection {
  page_id: string;               // Facebook page ID to connect
  page_access_token: string;     // Page access token
}

/**
 * FacebookApiPage - Raw Facebook API response for a page
 */
export interface FacebookApiPage {
  id: string;                    // Facebook page ID from API
  name: string;                  // Page name
  access_token: string;          // Page access token
  category: string;              // Page category
  fan_count?: number;            // Number of page followers
  picture?: any;                 // Page profile picture data
}

/**
 * DatabaseFacebookPage - Database representation of Facebook page
 */
export interface DatabaseFacebookPage {
  id: string;
  facebook_page_id: string;
  name: string;
  access_token: string;
  category: string;
  fan_count: number | null;
  picture: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
} 