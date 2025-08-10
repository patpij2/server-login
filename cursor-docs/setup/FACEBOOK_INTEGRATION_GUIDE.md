# 📘 Facebook API Integration Guide

This guide will walk you through setting up Facebook API integration to allow users to connect their Facebook pages and post content.

## 🚀 Prerequisites

1. **Facebook Developer Account**: You need a Facebook Developer account at [developers.facebook.com](https://developers.facebook.com)
2. **Facebook App**: Create a Facebook app in your developer account
3. **Environment Variables**: Set up the required environment variables

## 🔧 Environment Variables Setup

Add these variables to your `.env` file:

```bash
# Facebook Configuration
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:3000/facebook-callback.html
FACEBOOK_API_VERSION=v18.0
```

## 📱 Facebook App Setup

### 1. Create Facebook App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Create App"
3. Choose "Consumer" as the app type
4. Fill in your app details

### 2. Configure App Settings

1. **Basic Settings**:
   - App Name: Your app name
   - App Domain: `localhost` (for development)
   - Privacy Policy URL: Your privacy policy URL

2. **Facebook Login**:
   - Add Facebook Login product
   - Set Valid OAuth Redirect URIs to: `http://localhost:3000/facebook-callback.html`
   - Enable Client OAuth Login
   - Enable Web OAuth Login

3. **App Review** (Optional for development):
   - For development, you can use test users
   - For production, submit for review to get required permissions

### 3. Required Permissions

Your app needs these permissions:
- `pages_show_list` - List user's pages (this is the only valid permission for basic page reading)

**Note**: Facebook has deprecated many page permissions. The following scopes are no longer valid:
- `pages_manage_posts` - Posting to pages requires app review and additional permissions
- `pages_read_engagement` - Reading page insights requires app review

For basic functionality (listing and viewing pages), only `pages_show_list` is required.

## 🏗️ Architecture Overview

The Facebook integration consists of:

### Backend Components

1. **FacebookService** (`src/services/facebookService.ts`)
   - Handles OAuth flow
   - Manages page connections
   - Posts content to pages

2. **FacebookController** (`src/controllers/facebookController.ts`)
   - HTTP request handling
   - Input validation
   - Response formatting

3. **Facebook Routes** (`src/routes/facebookRoutes.ts`)
   - API endpoint definitions
   - Authentication middleware

4. **Database Schema** (`supabase_migrations/002_create_facebook_pages_table.sql`)
   - Stores page connections
   - User-page relationships

### Frontend Components

1. **Facebook Setup Page** (`frontend/facebook-setup.html`)
   - Page connection management
   - Post creation interface

2. **Facebook Callback** (`frontend/facebook-callback.html`)
   - OAuth callback handling
   - Success/error display

## 🔐 OAuth Flow

1. **User initiates connection**:
   - Frontend calls `/api/facebook/auth/url`
   - Backend generates Facebook OAuth URL
   - User is redirected to Facebook

2. **Facebook authorization**:
   - User grants permissions to your app
   - Facebook redirects to your callback URL with authorization code

3. **Token exchange**:
   - Backend exchanges code for access token
   - Fetches user's Facebook pages
   - Stores page connections in database

4. **Page management**:
   - User can view connected pages
   - Post content to pages
   - Manage page connections

## 📊 API Endpoints

### Public Endpoints

- `GET /api/facebook/auth/url` - Get Facebook OAuth URL
- `GET /api/facebook/auth/callback` - Handle OAuth callback

### Protected Endpoints (require authentication)

- `GET /api/facebook/pages` - Get user's connected pages
- `POST /api/facebook/post` - Post content to a page
- `DELETE /api/facebook/pages/:pageId` - Disconnect a page
- `PUT /api/facebook/pages/:pageId/refresh` - Refresh page data

## 💾 Database Schema

The `facebook_pages` table stores:

```sql
CREATE TABLE facebook_pages (
  id UUID PRIMARY KEY,
  facebook_page_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  category VARCHAR(255),
  fan_count INTEGER,
  picture TEXT,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Testing the Integration

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend

```bash
cd frontend
# Serve the HTML files (you can use any static server)
python -m http.server 3000
# or
npx serve -s . -l 3000
```

### 3. Test the Flow

1. Navigate to `http://localhost:3000/facebook-setup.html`
2. Click "Connect Facebook Pages"
3. Complete Facebook OAuth
4. View connected pages
5. Try posting content

## 🚨 Common Issues & Solutions

### 1. "App Not Setup" Error

**Cause**: Facebook app not properly configured
**Solution**: 
- Verify app ID and secret in environment variables
- Check app domain and redirect URI settings
- Ensure app is not in development mode (or use test users)

### 2. "Invalid OAuth Redirect URI" Error

**Cause**: Redirect URI mismatch
**Solution**:
- Verify `FACEBOOK_REDIRECT_URI` in environment
- Check Facebook app settings
- Ensure exact match between app and environment

### 3. "Insufficient Permissions" Error

**Cause**: App doesn't have required permissions
**Solution**:
- Add required permissions in Facebook app settings
- Submit app for review if using production permissions
- Use test users for development

### 4. "Page Access Token Expired" Error

**Cause**: Facebook access tokens expire
**Solution**:
- Implement token refresh logic
- Store refresh tokens in database
- Handle token expiration gracefully

## 🔒 Security Considerations

1. **Access Token Storage**: Store tokens securely in database
2. **User Authentication**: Verify user ownership of pages
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Input Validation**: Validate all user inputs
5. **Error Handling**: Don't expose sensitive information in errors

## 📈 Production Deployment

1. **Update Redirect URIs**: Change from localhost to your domain
2. **App Review**: Submit app for Facebook review
3. **SSL**: Ensure HTTPS for all OAuth flows
4. **Monitoring**: Add logging and monitoring
5. **Backup**: Implement backup for page connections

## 🔄 Future Enhancements

1. **Scheduled Posts**: Allow users to schedule posts
2. **Analytics**: Show post performance metrics
3. **Multi-page Management**: Bulk operations across pages
4. **Content Templates**: Pre-defined post templates
5. **Auto-posting**: Integration with other content sources

## 📚 Additional Resources

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Facebook Pages API](https://developers.facebook.com/docs/pages-api)
- [OAuth 2.0 Flow](https://tools.ietf.org/html/rfc6749)

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Check Facebook app settings
4. Review the logs in your backend
5. Ensure all dependencies are installed

---

**Note**: This integration requires a Facebook Developer account and app setup. Make sure to follow Facebook's terms of service and platform policies. 