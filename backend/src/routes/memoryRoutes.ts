/**
 * 🧠 ROUTES/MEMORYROUTES - The "Memory Menu"
 *
 * Defines the API endpoints related to memories.
 */
import { Router } from 'express';
import { MemoryController } from '../controllers/memoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// This route is protected. Only logged-in users can add memories.
router.post('/add', authenticateToken, MemoryController.addMemory);
router.post('/search', authenticateToken, MemoryController.searchMemories);
router.post('/ask', authenticateToken, MemoryController.askQuestion);

export default router;