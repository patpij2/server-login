import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';

const router = Router();

// Authentication routes
router.post('/register', ValidationMiddleware.validateRegistration, AuthController.register);
router.post('/login', ValidationMiddleware.validateLogin, AuthController.login);
router.get('/dashboard', authenticateToken, AuthController.getDashboard);

export default router; 