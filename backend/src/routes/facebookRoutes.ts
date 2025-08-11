/**
 * 📘 FACEBOOK ROUTES
 *
 * Defines all Facebook-related API endpoints and maps them to controller methods.
 * 
 * 🔐 AUTHENTICATION FLOW ROUTES:
 * GET  /facebook/auth/url      → Generate Facebook OAuth URL
 * GET  /facebook/auth/callback → Handle Facebook redirect (with auth code)
 * 
 * 📄 PAGE MANAGEMENT ROUTES:
 * GET    /facebook/status      → Check user's Facebook connection status
 * GET    /facebook/pages       → List user's connected Facebook pages
 * DELETE /facebook/pages/:id   → Remove a Facebook page connection
 * DELETE /facebook/disconnect  → Remove all Facebook connections
 * PUT    /facebook/pages/:id/refresh → Refresh page data from Facebook
 * 
 * 📝 POSTING ROUTES:
 * POST /facebook/post          → Create new post on Facebook page
 * POST /facebook/upload-media  → Upload media to Facebook
 * 
 * 🔧 UTILITY ROUTES:
 * GET /facebook/pages/:id/check-posting → Test if posting is available
 * GET /facebook/debug/inspect → Debug raw Facebook API responses
 * 
 * 🔒 SECURITY:
 * - All routes except /auth/callback require JWT authentication
 * - Users can only access their own Facebook pages
 * - Debug middleware logs all POST requests for troubleshooting
 * 
 * 🌊 TYPICAL USAGE FLOW:
 * 1. Frontend calls /auth/url → User gets Facebook login URL
 * 2. User clicks URL → Facebook login page opens
 * 3. User logs in → Facebook redirects to /auth/callback
 * 4. Callback stores page tokens → User's pages are now connected
 * 5. Frontend calls /pages → Get list of connected pages
 * 6. Frontend calls /post → Create posts on pages
 */

import { Router } from 'express';
import { FacebookController } from '../controllers/facebookController';
import { authenticateToken } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';

const router = Router();
const facebookController = new FacebookController();

// Auth URL route (requires authentication to get JWT token for state parameter)
router.get('/auth/url', authenticateToken, facebookController.getAuthUrl);

// Callback route (no authentication required - Facebook redirects here)
router.get('/auth/callback', facebookController.handleCallback);

// Debug route to inspect raw Facebook API responses (requires auth)
router.get('/debug/inspect', authenticateToken, facebookController.debugInspect);

// Protected routes (authentication required)
router.get('/status', authenticateToken, facebookController.getConnectionStatus);
router.get('/pages', authenticateToken, facebookController.getUserPages);
router.get('/pages/:pageId/posts', authenticateToken, facebookController.getPagePosts);
router.delete('/pages/:pageId', authenticateToken, facebookController.deletePageConnection);
router.delete('/disconnect', authenticateToken, facebookController.disconnectAllPages);
router.put('/pages/:pageId/refresh', authenticateToken, facebookController.refreshPageData);
router.get('/pages/:pageId/check-posting', authenticateToken, facebookController.checkPostingAvailability);

// Debug middleware for POST requests
router.use('/post', (req, res, next) => {
  console.log('🔍 === RAW POST REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Raw body:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('=== END RAW POST REQUEST DEBUG ===');
  next();
});

// Posting routes
router.post('/post', authenticateToken, facebookController.postToPage);
router.post('/upload-media', authenticateToken, facebookController.uploadMedia);

export default router; 