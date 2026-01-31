import { createClient } from 'redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.MESSAGE_CACHE_TTL = 3600; // 1 hour
    this.USER_CACHE_TTL = 1800; // 30 minutes
  }

  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // Cache user data
  async cacheUser(userId, userData, ttl = 3600) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(`user:${userId}`, ttl, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error caching user:', error);
      return false;
    }
  }

  // Get cached user data
  async getCachedUser(userId) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(`user:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached user:', error);
      return null;
    }
  }

  // Cache messages for a conversation
  async cacheMessages(conversationId, messages) {
    if (!this.isConnected) return false;
    
    try {
      const cacheKey = `messages:${conversationId}`;
      // Store messages as JSON string with TTL
      await this.client.setEx(cacheKey, this.MESSAGE_CACHE_TTL, JSON.stringify(messages));
      console.log(`Cached ${messages.length} messages for conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('Failed to cache messages:', error);
      return false;
    }
  }

  // Get cached messages for a conversation
  async getCachedMessages(conversationId) {
    if (!this.isConnected) return null;
    
    try {
      const cacheKey = `messages:${conversationId}`;
      const cached = await this.client.get(cacheKey);
      
      if (cached) {
        const messages = JSON.parse(cached);
        console.log(`Retrieved ${messages.length} cached messages for conversation ${conversationId}`);
        return messages;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached messages:', error);
      return null;
    }
  }

  // Invalidate messages cache for a conversation
  async invalidateMessagesCache(conversationId) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(`messages:${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error invalidating messages cache:', error);
      return false;
    }
  }

  // Cache online users
  async cacheOnlineUsers(users, ttl = 300) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx('online:users', ttl, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error caching online users:', error);
      return false;
    }
  }

  // Get cached online users
  async getCachedOnlineUsers() {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get('online:users');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached online users:', error);
      return null;
    }
  }

  // Rate limiting
  async incrementRateLimit(key, windowMs, maxRequests) {
    if (!this.isConnected) return { allowed: false, remaining: 0 };
    try {
      const current = await this.client.incr(key);
      if (current === 1) {
        await this.client.expire(key, Math.ceil(windowMs / 1000));
      }
      
      const ttl = await this.client.ttl(key);
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetTime: Date.now() + (ttl * 1000)
      };
    } catch (error) {
      console.error('Error in rate limiting:', error);
      return { allowed: true, remaining: maxRequests };
    }
  }
}

export default new RedisClient();
