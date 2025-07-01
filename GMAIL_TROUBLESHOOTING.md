# 🔧 Gmail Integration Troubleshooting Guide

## 🚨 Error: redirect_uri_mismatch

This error occurs when the redirect URI in your Google Cloud Console doesn't match exactly what the application is using.

### ✅ Solution Steps:

#### 1. **Check Current Application Configuration**
The application is configured to use:
```
Redirect URI: http://localhost:3000/gmail-callback.html
```

#### 2. **Update Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Find your **OAuth 2.0 Client ID** and click on it
5. In the **Authorized redirect URIs** section:
   - **Remove** any existing redirect URIs
   - **Add** exactly: `http://localhost:3000/gmail-callback.html`
   - **Important**: No trailing slash, exact case, exact protocol
6. Click **Save**

#### 3. **Verify Frontend Server**
Make sure your frontend is running on `http://localhost:3000`:

```bash
# Test if the callback page is accessible
curl http://localhost:3000/gmail-callback.html
```

You should see HTML content, not an error.

#### 4. **Restart Backend Server**
```bash
cd backend
npm run dev
```

#### 5. **Test the Integration**
1. Open your dashboard: `http://localhost:3000/dashboard.html`
2. Scroll to the Gmail Integration section
3. Click "🔗 Connect Gmail"
4. Complete the OAuth flow

## 🔍 Debugging Steps

### Check Environment Variables
Make sure your `.env` file in the backend directory has:
```env
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/gmail-callback.html
```

### Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try connecting Gmail
4. Look for any error messages

### Check Backend Logs
1. Watch the backend terminal output
2. Look for any error messages when trying to connect
3. Check for authentication errors

### Verify OAuth Flow
1. The flow should be:
   - Dashboard → Google OAuth → Callback Page → Dashboard
2. Each step should complete without errors

## 🛠️ Common Issues and Solutions

### Issue 1: "Invalid redirect URI"
**Cause**: Mismatch between Google Cloud Console and application
**Solution**: Update Google Cloud Console with exact URI

### Issue 2: "Access denied"
**Cause**: Gmail API not enabled or wrong credentials
**Solution**: 
1. Enable Gmail API in Google Cloud Console
2. Verify Client ID and Secret are correct

### Issue 3: "CORS error"
**Cause**: Frontend and backend on different ports
**Solution**: 
1. Make sure frontend runs on port 3000
2. Make sure backend runs on port 8000
3. Check CORS configuration in backend

### Issue 4: "Callback page not found"
**Cause**: Frontend server not running or wrong path
**Solution**:
1. Start frontend server: `python3 -m http.server 3000`
2. Verify `gmail-callback.html` exists in frontend directory

## 📋 Verification Checklist

- [ ] Google Cloud Console has correct redirect URI
- [ ] Gmail API is enabled
- [ ] OAuth2 credentials are correct
- [ ] Frontend server running on port 3000
- [ ] Backend server running on port 8000
- [ ] Environment variables set correctly
- [ ] `gmail-callback.html` file exists and is accessible
- [ ] No CORS errors in browser console
- [ ] Backend logs show no errors

## 🚀 Quick Test

1. **Test frontend accessibility**:
   ```bash
   curl http://localhost:3000/gmail-callback.html
   ```

2. **Test backend health**:
   ```bash
   curl http://localhost:8000/api/health
   ```

3. **Test Gmail auth URL**:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:8000/api/gmail/auth/url
   ```

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check the exact error message** in browser console
2. **Verify all environment variables** are set correctly
3. **Ensure both servers are running** and accessible
4. **Try clearing browser cache** and cookies
5. **Check if your Google account** has any restrictions

## 🔐 Security Notes

- Never commit your `.env` file to version control
- Keep your OAuth2 credentials secure
- In production, use HTTPS for all URLs
- Consider implementing proper session management 