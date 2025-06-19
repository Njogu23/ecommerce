// lib/cache.js - Redis-based caching service
import Redis from 'ioredis';

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      await this.redis.connect();
      this.isConnected = true;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.warn('⚠️  Redis connection failed, falling back to memory cache:', error.message);
      this.redis = null;
      this.isConnected = false;
    }
  }

  // Generate cache key
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.filter(Boolean).join(':')}`;
  }

  // Get from cache
  async get(key) {
    try {
      if (!this.isConnected || !this.redis) {
        return this.memoryCache.get(key);
      }

      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set to cache
  async set(key, value, ttlSeconds = 300) {
    try {
      const serialized = JSON.stringify(value);
      
      if (!this.isConnected || !this.redis) {
        return this.memoryCache.set(key, value, ttlSeconds);
      }

      if (ttlSeconds > 0) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete from cache
  async del(key) {
    try {
      if (!this.isConnected || !this.redis) {
        return this.memoryCache.delete(key);
      }

      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    try {
      if (!this.isConnected || !this.redis) {
        return this.memoryCache.deletePattern(pattern);
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  // Increment counter (useful for rate limiting)
  async incr(key, ttlSeconds = 3600) {
    try {
      if (!this.isConnected || !this.redis) {
        return 1; // Fallback
      }

      const count = await this.redis.incr(key);
      if (count === 1) {
        await this.redis.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      console.error('Cache incr error:', error);
      return 1;
    }
  }

  // Memory cache fallback
  memoryCache = new Map();

  // Clean up connection
  async disconnect() {
    if (this.redis && this.isConnected) {
      await this.redis.disconnect();
      this.isConnected = false;
    }
  }
}

// Memory cache with TTL for fallback
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    return item || null;
  }

  set(key, value, ttlSeconds = 300) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, value);

    // Set expiration timer
    if (ttlSeconds > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttlSeconds * 1000);
      
      this.timers.set(key, timer);
    }

    return true;
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }

  deletePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    
    return count;
  }

  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.timers.clear();
  }
}

// Singleton instance
const cache = new CacheService();

// Cache keys constants
export const CACHE_KEYS = {
  USERS_LIST: 'users:list',
  USER_DETAIL: 'user:detail',
  USER_ORDERS: 'user:orders',
  USER_REVIEWS: 'user:reviews',
  PRODUCTS_LIST: 'products:list',
  PRODUCT_DETAIL: 'product:detail',
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes  
  LONG: 900,        // 15 minutes
  HOUR: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
};

export default cache;