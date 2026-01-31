import { Server } from "socket.io";
import http from "http";
import express from "express";
import logger from "../utils/logger.js";
import redisClient from "../utils/redis.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Performance optimizations
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId : socketId}

// Enhanced connection handling with logging
io.on("connection", (socket) => {
  logger.logSocketEvent('connection', socket.id, { 
    ip: socket.handshake.address
  });

  const userId = socket.handshake.query.userId;
  
  // Validate userId
  if (!userId || userId === "undefined" || userId === "null") {
    logger.logSecurityEvent('Invalid connection attempt', { 
      socketId: socket.id,
      userId: userId,
      ip: socket.handshake.address
    });
    socket.disconnect();
    return;
  }

  // Clean up previous connections for this user
  const previousSocketId = userSocketMap[userId];
  if (previousSocketId && previousSocketId !== socket.id) {
    io.to(previousSocketId).emit('forceDisconnect', 'New login detected');
    delete userSocketMap[userId];
    logger.logSocketEvent('previous_connection_terminated', previousSocketId, { userId });
  }

  userSocketMap[userId] = socket.id;

  // Cache online users
  const onlineUsers = Object.keys(userSocketMap);
  redisClient.cacheOnlineUsers(onlineUsers);

  // Broadcast online users to all clients
  io.emit("getOnlineUsers", onlineUsers);
  
  logger.logSocketEvent('user_online', socket.id, { 
    userId, 
    totalOnline: onlineUsers.length 
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    logger.logSocketEvent('disconnect', socket.id, { 
      userId, 
      reason,
      ip: socket.handshake.address
    });

    delete userSocketMap[userId];
    
    // Update online users cache
    const onlineUsers = Object.keys(userSocketMap);
    redisClient.cacheOnlineUsers(onlineUsers);
    
    // Broadcast updated online users
    io.emit("getOnlineUsers", onlineUsers);
    
    logger.logSocketEvent('user_offline', socket.id, { 
      userId, 
      totalOnline: onlineUsers.length,
      reason 
    });
  });

  // Handle connection errors
  socket.on("error", (error) => {
    logger.error('Socket error', { 
      error: error.message, 
      socketId: socket.id,
      userId 
    });
  });

  // Handle force disconnect
  socket.on("forceDisconnect", () => {
    socket.disconnect();
    logger.logSocketEvent('force_disconnect', socket.id, { userId });
  });
});

// Track connection metrics
setInterval(() => {
  const metrics = {
    connectedSockets: io.engine.clientsCount,
    userConnections: Object.keys(userSocketMap).length,
    timestamp: new Date().toISOString()
  };
  
  logger.debug('Socket metrics', metrics);
}, 30000); // Log every 30 seconds

export { app, io, server };
