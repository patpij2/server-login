import { Router } from 'express';
import { GmailController } from '../controllers/gmailController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Gmail OAuth2 routes
router.get('/auth/url', authenticateToken, GmailController.getAuthUrl);
router.get('/callback', GmailController.handleCallback);

// Gmail API routes (require authentication)
router.post('/drafts/create', authenticateToken, GmailController.createDraft);
router.get('/profile', authenticateToken, GmailController.getProfile);
router.get('/drafts', authenticateToken, GmailController.listDrafts);
router.post('/test', authenticateToken, GmailController.testConnection);
router.get('/check', authenticateToken, GmailController.checkConnection);
router.delete('/disconnect', authenticateToken, GmailController.disconnect);

export default router; 