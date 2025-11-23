import { createClient } from 'redis';
import NodeCache from 'node-cache';

class CacheService {
  constructor() {
    // Redis client for distributed caching
    this.redisClient = null;
    
    // In-memory cache for local caching
    this.memoryCache = new NodeCache({
      stdTTL: 600, // Default 10 minutes
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false, // Don't clone objects (better performance)
      maxKeys: 1000 // Maximum number of keys
    });
    
    this.isRedisConnected = false;
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = createClient({
          url: process.env.REDIS_URL,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.log('Redis server connection refused');
              return 5000; // Retry after 5 seconds
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              console.log('Redis retry time exhausted');
              return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
              console.log('Redis max retry attempts reached');
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });

        this.redisClient.on('connect', () => {
          console.log('Connected to Redis');
          this.isRedisConnected = true;
        });

        this.redisClient.on('error', (err) => {
          console.log('Redis error:', err);
          this.isRedisConnected = false;
        });

        this.redisClient.on('disconnect', () => {
          console.log('Disconnected from Redis');
          this.isRedisConnected = false;
        });

        await this.redisClient.connect();
      }
    } catch (error) {
      console.log('Failed to initialize Redis:', error.message);
      this.isRedisConnected = false;
    }
  }

  // Get value from cache (tries Redis first, then memory cache)
  async get(key) {
    try {
      // Try Redis first if available
      if (this.isRedisConnected && this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value !== null) {
          return JSON.parse(value);
        }
      }
      
      // Fallback to memory cache
      return this.memoryCache.get(key);
    } catch (error) {
      console.log('Cache get error:', error.message);
      return this.memoryCache.get(key);
    }
  }

  // Set value in cache (both Redis and memory)
  async set(key, value, ttl = 600) {
    try {
      const serializedValue = JSON.stringify(value);
      
      // Set in Redis if available
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.setEx(key, ttl, serializedValue);
      }
      
      // Always set in memory cache as fallback
      this.memoryCache.set(key, value, ttl);
      
      return true;
    } catch (error) {
      console.log('Cache set error:', error.message);
      // Fallback to memory cache only
      this.memoryCache.set(key, value, ttl);
      return false;
    }
  }

  // Delete key from cache
  async del(key) {
    try {
      // Delete from Redis if available
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.del(key);
      }
      
      // Delete from memory cache
      this.memoryCache.del(key);
      
      return true;
    } catch (error) {
      console.log('Cache delete error:', error.message);
      this.memoryCache.del(key);
      return false;
    }
  }

  // Clear all cache
  async clear() {
    try {
      // Clear Redis if available
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.flushAll();
      }
      
      // Clear memory cache
      this.memoryCache.flushAll();
      
      return true;
    } catch (error) {
      console.log('Cache clear error:', error.message);
      this.memoryCache.flushAll();
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      // Check Redis first if available
      if (this.isRedisConnected && this.redisClient) {
        const exists = await this.redisClient.exists(key);
        if (exists) {return true;}
      }
      
      // Check memory cache
      return this.memoryCache.has(key);
    } catch (error) {
      console.log('Cache exists error:', error.message);
      return this.memoryCache.has(key);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      redis: {
        connected: this.isRedisConnected,
        client: this.redisClient ? 'initialized' : 'not initialized'
      },
      memory: {
        keys: this.memoryCache.keys().length,
        stats: this.memoryCache.getStats()
      }
    };
  }

  // Cache middleware for Express routes
  middleware(ttl = 600, keyGenerator = null) {
    return async (req, res, next) => {
      // Generate cache key
      const key = keyGenerator 
        ? keyGenerator(req) 
        : `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
      
      try {
        // Check if cached response exists
        const cachedData = await this.get(key);
        if (cachedData) {
          return res.json(cachedData);
        }
        
        // Store original res.json method
        const originalJson = res.json.bind(res);
        
        // Override res.json to cache the response
        res.json = (data) => {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.set(key, data, ttl).catch(err => {
              console.log('Failed to cache response:', err.message);
            });
          }
          
          return originalJson(data);
        };
        
        next();
      } catch (error) {
        console.log('Cache middleware error:', error.message);
        next();
      }
    };
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }
      
      // For memory cache, we need to manually check each key
      const memoryKeys = this.memoryCache.keys();
      const matchingKeys = memoryKeys.filter(key => {
        // Simple pattern matching (supports * wildcard)
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
      });
      
      matchingKeys.forEach(key => {
        this.memoryCache.del(key);
      });
      
      return true;
    } catch (error) {
      console.log('Cache invalidation error:', error.message);
      return false;
    }
  }

  // Bulk operations
  async mget(keys) {
    try {
      const results = {};
      
      if (this.isRedisConnected && this.redisClient) {
        const values = await this.redisClient.mGet(keys);
        keys.forEach((key, index) => {
          if (values[index] !== null) {
            results[key] = JSON.parse(values[index]);
          }
        });
      }
      
      // Fill missing values from memory cache
      keys.forEach(key => {
        if (!(key in results)) {
          const value = this.memoryCache.get(key);
          if (value !== undefined) {
            results[key] = value;
          }
        }
      });
      
      return results;
    } catch (error) {
      console.log('Cache mget error:', error.message);
      const results = {};
      keys.forEach(key => {
        const value = this.memoryCache.get(key);
        if (value !== undefined) {
          results[key] = value;
        }
      });
      return results;
    }
  }

  async mset(keyValuePairs, ttl = 600) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const pipeline = this.redisClient.multi();
        
        Object.entries(keyValuePairs).forEach(([key, value]) => {
          pipeline.setEx(key, ttl, JSON.stringify(value));
        });
        
        await pipeline.exec();
      }
      
      // Set in memory cache
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        this.memoryCache.set(key, value, ttl);
      });
      
      return true;
    } catch (error) {
      console.log('Cache mset error:', error.message);
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        this.memoryCache.set(key, value, ttl);
      });
      return false;
    }
  }

  // Graceful shutdown
  async close() {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      this.memoryCache.close();
    } catch (error) {
      console.log('Cache close error:', error.message);
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Common cache key generators
const cacheKeys = {
  user: (userId) => `user:${userId}`,
  course: (courseId) => `course:${courseId}`,
  courseList: (filters) => `courses:${JSON.stringify(filters)}`,
  userCourses: (userId) => `user:${userId}:courses`,
  courseAnalytics: (courseId) => `analytics:course:${courseId}`,
  userAnalytics: (userId) => `analytics:user:${userId}`,
  popularCourses: (category = 'all') => `popular:courses:${category}`,
  searchResults: (query, filters) => `search:${query}:${JSON.stringify(filters)}`
};

export { cacheService, cacheKeys };