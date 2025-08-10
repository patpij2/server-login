import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import { UserController } from '../controllers/userController';
import memoryRoutes from './memoryRoutes';
import gmailRoutes from './gmailRoutes';
import facebookRoutes from './facebookRoutes';

const router = Router();

// Health check route
router.get('/health', UserController.healthCheck);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/memories', memoryRoutes);
router.use('/gmail', gmailRoutes);
router.use('/facebook', facebookRoutes);

export default router; 