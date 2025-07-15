import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { connectDatabase, disconnectDatabase } from './utils/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import timesheetRoutes from './routes/timesheets';
import reportRoutes from './routes/reports';
import activityRoutes from './routes/activities';
import holidayRoutes from './routes/holidays';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/holidays', holidayRoutes);

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'Painai API v1.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      timesheets: '/api/timesheets',
      reports: '/api/reports',
      activities: '/api/activities',
      holidays: '/api/holidays'
    }
  });
});

// Serve static files from frontend build
const frontendPath = path.join(__dirname, '../frontend');
const indexPath = path.join(frontendPath, 'index.html');

// Check if frontend build exists
if (process.env.NODE_ENV === 'production') {
  try {
    const fs = require('fs');
    if (!fs.existsSync(indexPath)) {
      console.warn('⚠️  Frontend build not found. API-only mode enabled.');
      console.warn('📁 Expected path:', indexPath);
      console.warn('💡 Make sure to run the build script before deployment.');
    } else {
      app.use(express.static(frontendPath));
    }
  } catch (error) {
    console.warn('⚠️  Could not check frontend build:', error);
  }
} else {
  // In development, try to serve frontend if it exists
  try {
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      app.use(express.static(frontendPath));
    }
  } catch (error) {
    // Ignore errors in development
  }
}

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return notFoundHandler(req, res);
  }
  
  // Check if frontend build exists
  try {
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Return a helpful error message
      res.status(404).json({
        success: false,
        message: 'Frontend build not found. Please ensure the frontend has been built and copied to the backend directory.',
        expectedPath: indexPath,
        suggestion: 'Run the build script: ./scripts/build-for-deployment.sh'
      });
    }
      } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error serving frontend',
        error: error instanceof Error ? error.message : String(error)
      });
    }
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Painai API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Connect to database
  try {
    await connectDatabase();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
});

export default app; 