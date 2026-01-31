import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import messagesRoutes from "./routes/messages.route.js";
import userRoutes from "./routes/user.route.js";
import connect from "./dbConfig/mongoDBconnect.js";
import { app, server } from "./socket/socket.js";
import redisClient from "./utils/redis.js";
import rateLimiter from "./middlewares/rateLimiter.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import performanceMonitor from "./utils/performanceMonitor.js";
import logger from "./utils/logger.js";

// --------------------------------- code ---------------------------------------------

const __dirname = path.resolve();

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize database connections
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connect();
    logger.info("MongoDB connected successfully");
    
    // Connect to Redis
    const redisConnected = await redisClient.connect();
    if (redisConnected) {
      logger.info("Redis connected successfully");
    } else {
      logger.warn("Redis connection failed, continuing without cache");
    }
  } catch (error) {
    logger.error("Failed to initialize databases", { error: error.message });
  }
};

const PORT = process.env.PORT || 5000;

// Performance monitoring middleware
app.use(performanceMonitor.requestTracker());

// Rate limiting middleware
app.use("/api/", rateLimiter(15 * 60 * 1000, 100, "Too many requests from this IP")); // 100 requests per 15 minutes

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// middlewares
app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", performanceMonitor.healthCheck());

// Metrics endpoint (protected in production)
if (process.env.NODE_ENV === 'development') {
  app.get("/metrics", (req, res) => {
    res.json(performanceMonitor.getMetrics());
  });
}

// Serve static files
app.use(express.static(path.join(__dirname, "/frontend/dist")));

// Catch-all handler for frontend routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Global error handler
app.use(globalErrorHandler);

// Track Socket.IO performance
performanceMonitor.trackSocketConnections(server);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await redisClient.disconnect();
    logger.info("Redis disconnected");
    
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  } catch (error) {
    logger.error("Error during graceful shutdown", { error: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Initialize and start server
initializeApp().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server started at port : ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(error => {
  logger.error("Failed to start server", { error: error.message });
  process.exit(1);
});
