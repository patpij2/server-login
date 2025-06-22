import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { ValidationMiddleware } from '../middleware/validation';

const router = Router();

// User routes
router.get('/', UserController.getAllUsers);
router.get('/:id', ValidationMiddleware.validateUserId, UserController.getUserById);

export default router; 