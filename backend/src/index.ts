import dotenv from 'dotenv';
dotenv.config(); // Add this line to the top

import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { API_CONFIG, API_ENDPOINTS } from './config/constants';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { Logger } from './utils/logger';

// Create Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(API_CONFIG.PORT, () => {
  Logger.info(`🚀 Backend API Server running on http://localhost:${API_CONFIG.PORT}`, 'Server');
  Logger.info('📝 Available API endpoints:', 'Server');
  Logger.info(`  POST ${API_ENDPOINTS.AUTH.REGISTER} - Register a new user`, 'Server');
  Logger.info(`  POST ${API_ENDPOINTS.AUTH.LOGIN} - Login user`, 'Server');
  Logger.info(`  GET ${API_ENDPOINTS.USERS.ALL} - List all users (for testing)`, 'Server');
  Logger.info(`  GET ${API_ENDPOINTS.USERS.BY_ID} - Get user by ID`, 'Server');
  Logger.info(`  GET ${API_ENDPOINTS.HEALTH} - Health check`, 'Server');
  Logger.info('', 'Server');
  Logger.info('💡 Frontend should run on http://localhost:3000', 'Server');
  Logger.info('🗄️  Using Supabase database', 'Server');
  Logger.info('🏗️  Professional architecture with organized code', 'Server');
});