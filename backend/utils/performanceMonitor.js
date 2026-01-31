import logger from "./logger.js";

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      activeConnections: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    this.startTime = Date.now();
  }

  // Middleware to track request performance
  requestTracker() {
    return (req, res, next) => {
      const startTime = process.hrtime.bigint();
      
      this.metrics.requests++;
      
      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        this.metrics.responseTime.push(responseTime);
        
        // Keep only last 1000 response times for memory efficiency
        if (this.metrics.responseTime.length > 1000) {
          this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
        }
        
        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }
        
        logger.logRequest(req, res, responseTime);
      });
      
      next();
    };
  }

  // Track Socket.IO connections
  trackSocketConnections(io) {
    io.on('connection', (socket) => {
      this.metrics.activeConnections++;
      logger.logSocketEvent('connection', socket.id, { activeConnections: this.metrics.activeConnections });
      
      socket.on('disconnect', () => {
        this.metrics.activeConnections--;
        logger.logSocketEvent('disconnect', socket.id, { activeConnections: this.metrics.activeConnections });
      });
    });
  }

  // Get performance metrics
  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;
    
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime: `${Math.floor(uptime / 1000)}s`,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%' : '0%',
      avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
      activeConnections: this.metrics.activeConnections,
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`
      },
      cpuUsage: process.cpuUsage()
    };
  }

  // Health check endpoint
  healthCheck() {
    return (req, res) => {
      const metrics = this.getMetrics();
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: metrics.uptime,
        memory: metrics.memoryUsage,
        performance: {
          requests: metrics.requests,
          errors: metrics.errors,
          errorRate: metrics.errorRate,
          avgResponseTime: metrics.avgResponseTime,
          activeConnections: metrics.activeConnections
        }
      };

      // Determine if system is under stress
      const memoryUsagePercent = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
      if (memoryUsagePercent > 90 || parseFloat(metrics.errorRate) > 10) {
        health.status = 'degraded';
        res.status(503);
      }

      res.json(health);
    };
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      activeConnections: this.metrics.activeConnections, // Keep current connections
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    this.startTime = Date.now();
  }
}

export default new PerformanceMonitor();
