# Gmail Credentials Storage Setup

This guide explains how to set up persistent Gmail credentials storage using Supabase.

## Overview

The Gmail integration now stores credentials securely in Supabase instead of browser session storage. This means:

- ✅ Gmail connection persists across browser refreshes
- ✅ Credentials are stored securely in the database
- ✅ Automatic token refresh when needed
- ✅ Users can disconnect and reconnect easily

## Database Setup

### 1. Create the Gmail Credentials Table

Run the SQL migration script in your Supabase SQL editor:

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
-- Users can only access their own credentials
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

### 2. Verify the Table Structure

After running the migration, you should see:

- `gmail_credentials` table created
- Row Level Security (RLS) enabled
- Policies created for user access control
- Index on `user_id` for performance
- Trigger for automatic `updated_at` updates

## How It Works

### 1. OAuth Flow
1. User clicks "Connect Gmail" in dashboard
2. Backend generates OAuth URL with user ID in state parameter
3. User authorizes in Google OAuth popup
4. Google redirects to callback with authorization code
5. Backend exchanges code for tokens and stores in database
6. Frontend receives success message and updates UI

### 2. Credential Management
- **Storage**: Credentials stored in `gmail_credentials` table
- **Security**: RLS ensures users only access their own credentials
- **Refresh**: Access tokens automatically refreshed when expired
- **Cleanup**: Credentials deleted when user disconnects

### 3. API Usage
- **Create Draft**: Backend retrieves user's credentials and creates draft
- **Test Connection**: Backend uses stored credentials to test Gmail API
- **Disconnect**: Backend deletes user's credentials from database

## API Endpoints

### New Endpoints
- `GET /api/gmail/check` - Check if user has Gmail connected
- `DELETE /api/gmail/disconnect` - Disconnect Gmail account

### Updated Endpoints
- `GET /api/gmail/auth/url` - Now includes user ID in state parameter
- `GET /api/gmail/callback` - Now stores credentials in database
- `POST /api/gmail/drafts/create` - Now uses stored credentials
- `POST /api/gmail/test` - Now uses stored credentials
- `GET /api/gmail/profile` - Now uses stored credentials
- `GET /api/gmail/drafts` - Now uses stored credentials

## Frontend Changes

### Dashboard Updates
- ✅ Checks Gmail connection status on page load
- ✅ Shows connected/disconnected state
- ✅ Disconnect button for removing Gmail connection
- ✅ No longer stores credentials in browser memory

### Gmail Callback Updates
- ✅ Simplified callback handling
- ✅ No longer passes credentials to parent window
- ✅ Just sends success message to trigger UI update

## Security Features

### Row Level Security (RLS)
- Users can only access their own Gmail credentials
- Automatic filtering by `auth.uid()`
- Prevents unauthorized access to other users' credentials

### Token Management
- Access tokens automatically refreshed when expired
- Refresh tokens stored securely
- Credentials deleted on disconnect

### Database Security
- Credentials encrypted at rest (Supabase default)
- Connection uses SSL/TLS
- Access controlled by RLS policies

## Troubleshooting

### Common Issues

1. **"Gmail not connected" error**
   - Check if user has completed OAuth flow
   - Verify credentials exist in database
   - Check if tokens are expired

2. **"Failed to refresh access token"**
   - Refresh token may be invalid
   - User may need to reconnect Gmail
   - Check Google Cloud Console settings

3. **"User ID is required" error**
   - Ensure user is authenticated
   - Check JWT token is valid
   - Verify auth middleware is working

### Database Queries

Check if user has credentials:
```sql
SELECT * FROM gmail_credentials WHERE user_id = 'user-uuid-here';
```

Check for expired tokens:
```sql
SELECT * FROM gmail_credentials WHERE expiry_date < EXTRACT(EPOCH FROM NOW()) * 1000;
```

## Migration from Session Storage

If you're upgrading from the old session-based system:

1. Users will need to reconnect their Gmail accounts
2. Old session credentials will be lost
3. New credentials will be stored in database
4. Connection will persist across browser sessions

## Testing

1. **Connect Gmail**: Click "Connect Gmail" and complete OAuth
2. **Refresh Page**: Verify connection persists
3. **Create Draft**: Test draft creation with stored credentials
4. **Disconnect**: Test disconnect functionality
5. **Reconnect**: Verify reconnection works

The system now provides a much more robust and user-friendly Gmail integration experience! 