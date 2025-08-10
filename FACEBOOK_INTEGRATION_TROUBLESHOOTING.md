# 🔧 Facebook Integration Troubleshooting Guide

## 🚨 Current Issue: Facebook Pages Not Connecting After Authorization

### 🔍 Problem Description
Even after authorizing Facebook pages through the OAuth flow, the dashboard shows "Not Connected" status and "0 pages".

### 🛠️ What I've Fixed

#### 1. Frontend Issues ✅
- **Fixed ID mismatch**: JavaScript was looking for `facebook-section` ID but HTML had class
- **Updated status display logic**: Now properly shows connection status and page count
- **Added missing event listeners**: Connect button, refresh, and post functionality
- **Fixed API endpoint**: Changed from `/facebook/posts` to `/facebook/post` to match backend
- **Enhanced UI**: Added proper styling and status indicators

#### 2. Backend Issues ✅
- **Fixed API version mismatch**: Now uses environment variable consistently
- **Enhanced error logging**: Added detailed debugging for Facebook API calls
- **Updated permissions**: Removed invalid scopes, now only using `pages_show_list` (valid permission)

### 🔍 Root Cause Analysis

The main issues were:

1. **Frontend JavaScript errors**: The `updateFacebookStatus()` function couldn't find the Facebook section element
2. **Missing event handlers**: Connect button and other Facebook functionality wasn't working
3. **API endpoint mismatch**: Frontend was calling wrong endpoints
4. **Limited Facebook permissions**: Only requesting `pages_show_list` scope

### 🚀 How to Test the Fix

#### Step 1: Verify Backend is Running
```bash
cd backend
npm start
```

#### Step 2: Test Facebook Endpoints
```bash
# Test if backend responds (should get 401 - expected without auth)
curl http://localhost:8000/api/facebook/status

# Test auth URL endpoint
curl http://localhost:8000/api/facebook/auth/url
```

#### Step 3: Test Frontend Integration
1. Open `test-facebook-integration.html` in your browser
2. Click "Test Backend" - should show ✅ Backend is running!
3. Test other endpoints to verify they respond correctly

#### Step 4: Test Full Integration
1. Open `frontend/dashboard.html` in your browser
2. Login with your credentials
3. Go to Facebook Integration section
4. Click "🔗 Connect Facebook"
5. Complete Facebook OAuth flow
6. Check if pages are now connected

### 🔐 Facebook App Configuration Requirements

#### Required Permissions
- `pages_show_list` - View user's pages
- `pages_show_list` - List user's Facebook pages (only valid permission)
- **Note**: `pages_read_engagement` and `pages_manage_posts` are deprecated and no longer valid

#### App Review Status
⚠️ **Important**: These permissions require Facebook App Review approval for production use.

**For Development/Testing:**
- Use your personal Facebook account as admin
- Add test users to your app
- Test with pages you own

### 🐛 Common Issues & Solutions

#### Issue 1: "Access token required" error
**Cause**: Backend is working but no valid JWT token
**Solution**: Ensure you're logged in through the frontend

#### Issue 2: Facebook OAuth fails
**Cause**: Incorrect redirect URI or app configuration
**Solution**: 
- Check `FACEBOOK_REDIRECT_URI` in `.env`
- Verify app settings in Facebook Developer Console

#### Issue 3: Pages not showing after authorization
**Cause**: Facebook API permission issues or token exchange failure
**Solution**: 
- Check backend logs for Facebook API errors
- Verify app has required permissions
- Check if app is in development mode

#### Issue 4: "Invalid redirect URI" error
**Cause**: Facebook app redirect URI doesn't match environment variable
**Solution**: Update Facebook app settings to include `http://localhost:3000/facebook-callback.html`

### 📋 Debugging Steps

#### 1. Check Backend Logs
```bash
# Watch backend logs for Facebook API calls
tail -f backend/logs/app.log
```

#### 2. Check Browser Console
- Open Developer Tools (F12)
- Look for JavaScript errors
- Check Network tab for failed API calls

#### 3. Test Individual Endpoints
Use the test page (`test-facebook-integration.html`) to isolate issues

#### 4. Verify Environment Variables
```bash
cd backend
grep -E "FACEBOOK_|SUPABASE_" .env
```

### 🔄 Next Steps

1. **Test the current fix** using the steps above
2. **Check Facebook app permissions** in Developer Console
3. **Verify app review status** if using in production
4. **Test with a simple page post** to verify full functionality

### 📞 If Still Not Working

1. Check backend logs for specific Facebook API errors
2. Verify Facebook app configuration matches environment variables
3. Test with a different Facebook account/page
4. Check if Facebook app is in development mode and add test users

### 🎯 Expected Behavior After Fix

- ✅ Facebook Integration section shows proper status
- ✅ Connect button opens Facebook OAuth popup
- ✅ After authorization, pages are listed
- ✅ Post creation form becomes available
- ✅ Page management (refresh, remove) works

---

**Last Updated**: August 10, 2025
**Status**: Frontend and backend fixes applied, ready for testing 