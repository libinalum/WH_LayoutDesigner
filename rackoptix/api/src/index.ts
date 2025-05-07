/**
 * Main entry point for the RackOptix API server.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import WebSocket from 'ws';

import { logger } from './utils/logger';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Request logging

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'RackOptix API',
    version: '0.1.0',
    description: 'API for warehouse layout optimization',
    endpoints: {
      api: '/api',
      health: '/health',
      docs: '/api-docs'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'RackOptix API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');

  // Send welcome message
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to RackOptix API' }));

  // Handle messages
  ws.on('message', (message) => {
    logger.debug(`Received WebSocket message: ${message}`);
    
    // In a real implementation, this would handle different message types
    // For now, just echo the message back
    ws.send(message);
  });

  // Handle disconnection
  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`RackOptix API server running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`API: Server is running at http://localhost:${PORT}`); // Added log
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // In production, you might want to gracefully shut down the server
  // process.exit(1);
});

export { app, server };