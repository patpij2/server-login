# 📧 Gmail Integration Complete Guide

This comprehensive guide covers everything you need to know about setting up and using Gmail integration in the login system.

## 📋 Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Database Configuration](#database-configuration)
3. [Usage Guide](#usage-guide)
4. [Troubleshooting](#troubleshooting)
5. [API Reference](#api-reference)
6. [Security Notes](#security-notes)

---

## 🔧 Setup Instructions

### Prerequisites

1. **Google Cloud Console Account**
2. **Gmail API enabled**
3. **OAuth2 credentials configured**
4. **Supabase database setup**

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

### Step 2: Configure OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - **Name**: `Gmail Integration`
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/gmail-callback.html`

### Step 3: Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Gmail OAuth2 Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/gmail-callback.html
```

### Step 4: Install Dependencies

```bash
cd backend
npm install googleapis google-auth-library
```

---

## 🗄️ Database Configuration

### Create Gmail Credentials Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create gmail_credentials table
CREATE TABLE IF NOT EXISTS gmail_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    scope TEXT NOT NULL,
    token_type TEXT NOT NULL DEFAULT 'Bearer',
    expiry_date BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_gmail_credentials_user_id ON gmail_credentials(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE gmail_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own gmail credentials" ON gmail_credentials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gmail credentials" ON gmail_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gmail credentials" ON gmail_credentials
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gmail credentials" ON gmail_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_gmail_credentials_updated_at 
    BEFORE UPDATE ON gmail_credentials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 🚀 Usage Guide

### Starting the Services

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   # Serve the files using any static server
   python -m http.server 3000
   # Or with Node.js:
   npx serve -p 3000
   ```

### Connecting Gmail Account

1. Open the dashboard in your browser
2. Scroll down to the "Gmail Integration" section
3. Click "🔗 Connect Gmail"
4. A popup window will open with Google's OAuth consent screen
5. Sign in with your Gmail account and grant permissions
6. The popup will close automatically and show "✅ Gmail Connected Successfully!"

### Creating Gmail Drafts

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

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error

**Cause**: Redirect URI in Google Cloud Console doesn't match application

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your **OAuth 2.0 Client ID** and click on it
4. In **Authorized redirect URIs**:
   - Remove any existing redirect URIs
   - Add exactly: `http://localhost:3000/gmail-callback.html`
   - **Important**: No trailing slash, exact case, exact protocol
5. Click **Save**

#### 2. "Access denied" Error

**Cause**: Gmail API not enabled or wrong credentials

**Solution**:
1. Enable Gmail API in Google Cloud Console
2. Verify Client ID and Secret are correct

#### 3. "CORS error"

**Cause**: Frontend and backend on different ports

**Solution**:
1. Make sure frontend runs on port 3000
2. Make sure backend runs on port 8000
3. Check CORS configuration in backend

#### 4. "Gmail not connected" Error

**Cause**: User hasn't completed OAuth flow or credentials expired

**Solution**:
1. Check if user has completed OAuth flow
2. Verify credentials exist in database
3. Check if tokens are expired
4. Reconnect Gmail account if needed

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   # Verify .env file has correct values
   cat backend/.env | grep GOOGLE
   ```

2. **Check Browser Console**:
   - Open browser developer tools (F12)
   - Go to Console tab
   - Look for error messages

3. **Check Backend Logs**:
   - Watch the backend terminal output
   - Look for authentication errors

4. **Test API Endpoints**:
   ```bash
   # Test backend health
   curl http://localhost:8000/api/health
   
   # Test Gmail auth URL (requires JWT token)
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:8000/api/gmail/auth/url
   ```

### Verification Checklist

- [ ] Google Cloud Console has correct redirect URI
- [ ] Gmail API is enabled
- [ ] OAuth2 credentials are correct
- [ ] Frontend server running on port 3000
- [ ] Backend server running on port 8000
- [ ] Environment variables set correctly
- [ ] `gmail-callback.html` file exists and is accessible
- [ ] Database table created with RLS policies
- [ ] No CORS errors in browser console
- [ ] Backend logs show no errors

---

## 📚 API Reference

### Authentication Endpoints

- `GET /api/gmail/auth/url` - Get OAuth2 authorization URL
- `GET /api/gmail/callback` - Handle OAuth2 callback
- `GET /api/gmail/check` - Check if user has Gmail connected
- `DELETE /api/gmail/disconnect` - Disconnect Gmail account

### Gmail API Endpoints

- `POST /api/gmail/drafts/create` - Create a Gmail draft
- `GET /api/gmail/profile` - Get Gmail profile
- `GET /api/gmail/drafts` - List Gmail drafts
- `POST /api/gmail/test` - Test Gmail connection

### Example API Usage

```bash
# Get OAuth URL
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/gmail/auth/url

# Create draft
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "recipient@example.com",
       "subject": "Test Email",
       "body": "This is a test email"
     }' \
     http://localhost:8000/api/gmail/drafts/create

# Check connection status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/gmail/check
```

---

## 🔐 Security Notes

### Development Environment
- Credentials stored in database with Row Level Security
- Access tokens automatically refreshed when expired
- Users can only access their own credentials

### Production Considerations
- Use HTTPS for all URLs
- Implement proper session management
- Add rate limiting to API endpoints
- Monitor API usage in Google Cloud Console
- Regularly update dependencies for security patches

### Database Security
- Credentials encrypted at rest (Supabase default)
- Connection uses SSL/TLS
- Access controlled by RLS policies
- Automatic cleanup on user deletion

### Token Management
- Access tokens automatically refreshed when expired
- Refresh tokens stored securely
- Credentials deleted on disconnect
- No credentials stored in browser memory

---

## 📞 Support

If you're still experiencing issues:

1. Check the exact error message in browser console
2. Verify all environment variables are set correctly
3. Ensure both servers are running and accessible
4. Try clearing browser cache and cookies
5. Check if your Google account has any restrictions

## 🔄 Updates and Maintenance

- Keep your Google Cloud project and OAuth2 credentials secure
- Monitor API usage in Google Cloud Console
- Regularly update dependencies for security patches
- Test the integration after any code changes

## 📖 Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Documentation](https://supabase.com/docs) 