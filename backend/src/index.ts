import dotenv from 'dotenv';
dotenv.config(); // Add this line to the top

import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { API_CONFIG, API_ENDPOINTS } from './config/constants';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { Logger } from './utils/logger';
import os from 'os';

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

// Get local IP address for network access
function getLocalIPAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIPAddress();

// Start server
app.listen(Number(API_CONFIG.PORT), '0.0.0.0', () => {
  Logger.info(`🚀 Backend API Server running on:`, 'Server');
  Logger.info(`   Local: http://localhost:${API_CONFIG.PORT}`, 'Server');
  Logger.info(`   Network: http://${localIP}:${API_CONFIG.PORT}`, 'Server');
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