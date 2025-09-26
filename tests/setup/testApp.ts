import express, { Express } from 'express';
import cors from 'cors';
import compression from 'compression';
import authRoutes from '../../src/routes/auth.routes';
import userRoutes from '../../src/routes/user.routes';
import { errorHandler, notFoundHandler } from '../../src/middleware/error.middleware';

export const createTestApp = (): Express => {
  const app: Express = express();

  // Global middleware
  app.use(cors());
  app.use(compression());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Gym Management API is running',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};