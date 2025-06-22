import dotenv from 'dotenv';
dotenv.config(); // Add this line to the top

import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

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
app.listen(config.port, () => {
  console.log(`🚀 Backend API Server running on http://localhost:${config.port}`);
  console.log('📝 Available API endpoints:');
  console.log('  POST /api/auth/register - Register a new user');
  console.log('  POST /api/auth/login - Login user');
  console.log('  GET /api/users - List all users (for testing)');
  console.log('  GET /api/users/:id - Get user by ID');
  console.log('  GET /api/health - Health check');
  console.log('');
  console.log('💡 Frontend should run on http://localhost:3000');
  console.log('🗄️  Using Supabase database');
  console.log('🏗️  Professional architecture with organized code');
});