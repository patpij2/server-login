/**
 * 📘 FACEBOOK ROUTES
 * 
 * Defines all Facebook-related API endpoints
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