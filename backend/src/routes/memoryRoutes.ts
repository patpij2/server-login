/**
 * 🧠 ROUTES/MEMORYROUTES - The "Memory Menu"
 *
 * Defines the API endpoints related to memories.
 */
import { Router } from 'express';
import { MemoryController } from '../controllers/memoryController';
import { authenticateToken } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';

const router = Router();

// This route is protected. Only logged-in users can add memories.
router.post('/add', authenticateToken, ValidationMiddleware.validateMemoryContent, MemoryController.addMemory);
router.post('/search', authenticateToken, ValidationMiddleware.validateSearchQuery, MemoryController.searchMemories);
router.post('/ask', authenticateToken, ValidationMiddleware.validateQuestion, MemoryController.askQuestion);
router.post('/generate-email-schema', authenticateToken, ValidationMiddleware.validateEmailSchemaPrompt, MemoryController.generateEmailSchema);

export default router;