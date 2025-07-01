# 📧 Gmail Integration Setup Guide

This guide will help you set up Gmail OAuth2 integration for creating drafts from the dashboard.

## 🔧 Prerequisites

1. **Google Cloud Console Account**
2. **Gmail API enabled**
3. **OAuth2 credentials configured**

## 📋 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

### 2. Configure OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - **Name**: `Gmail Integration`
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/gmail-callback.html`

### 3. Get Your Credentials

After creating the OAuth2 client, you'll get:
- **Client ID**
- **Client Secret**

### 4. Set Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Gmail OAuth2 Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/gmail-callback.html
```

### 5. Install Dependencies

```bash
cd backend
npm install googleapis google-auth-library
```

### 6. Start the Services

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend** (if using a local server):
   ```bash
   cd frontend
   # Serve the files using any static server
   # For example, with Python:
   python -m http.server 3000
   # Or with Node.js:
   npx serve -p 3000
   ```

## 🚀 How to Use

### 1. Connect Gmail Account

1. Open the dashboard in your browser
2. Scroll down to the "Gmail Integration" section
3. Click "🔗 Connect Gmail"
4. A popup window will open with Google's OAuth consent screen
5. Sign in with your Gmail account and grant permissions
6. The popup will close automatically and show "✅ Gmail Connected Successfully!"

### 2. Create Gmail Drafts

1. After connecting Gmail, the draft form will appear
2. Fill in the email details:
   - **To**: Recipient email address
   - **Subject**: Email subject
   - **CC**: Carbon copy recipients (optional)
   - **BCC**: Blind carbon copy recipients (optional)
   - **Body**: Email content
3. Click "📝 Create Draft"
4. The draft will be created in your Gmail account
5. Click the link to open Gmail Drafts

## 🔐 Security Notes

- **Development Only**: This implementation stores credentials in the browser session for development purposes
- **Production**: In a production environment, you should:
  - Store credentials securely in a database
  - Implement proper session management
  - Use HTTPS for all communications
  - Add proper error handling and token refresh logic

## 🛠️ API Endpoints

The Gmail integration provides these endpoints:

- `GET /api/gmail/auth/url` - Get OAuth2 authorization URL
- `GET /api/gmail/callback` - Handle OAuth2 callback
- `POST /api/gmail/drafts/create` - Create a Gmail draft
- `GET /api/gmail/profile` - Get Gmail profile
- `GET /api/gmail/drafts` - List Gmail drafts

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:
   - Make sure the redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/gmail-callback.html`

2. **"Access denied" error**:
   - Check that the Gmail API is enabled in your Google Cloud project
   - Verify your OAuth2 credentials are correct

3. **"CORS error"**:
   - Ensure the frontend is running on `http://localhost:3000`
   - Check that the backend CORS settings allow the frontend origin

4. **"Token expired" error**:
   - The access token expires after 1 hour
   - The refresh token should automatically get a new access token
   - If issues persist, reconnect your Gmail account

### Debug Mode

To see detailed logs, check the browser console and backend logs for error messages.

## 📚 Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## 🔄 Updates and Maintenance

- Keep your Google Cloud project and OAuth2 credentials secure
- Monitor API usage in Google Cloud Console
- Regularly update dependencies for security patches
- Test the integration after any code changes 