import redisClient from "../utils/redis.js";

const rateLimiter = (windowMs, maxRequests, message = "Too many requests") => {
  return async (req, res, next) => {
    try {
      const key = `rate_limit:${req.ip}:${req.originalUrl}`;
      const result = await redisClient.incrementRateLimit(key, windowMs, maxRequests);
      
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });

      if (!result.allowed) {
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // If Redis fails, allow the request
      next();
    }
  };
};

export default rateLimiter;
