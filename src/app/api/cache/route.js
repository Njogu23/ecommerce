// /api/cache/route.js - Cache management and monitoring
import cache, { CACHE_KEYS } from '@/lib/cache';
import { NextResponse } from 'next/server';

// Cache statistics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return await getCacheStats();
      case 'keys':
        return await getCacheKeys();
      case 'health':
        return await getCacheHealth();
      default:
        return NextResponse.json({
          availableActions: ['stats', 'keys', 'health', 'clear', 'warm']
        });
    }

  } catch (error) {
    console.error('Cache GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get cache info' },
      { status: 500 }
    );
  }
}

async function getCacheStats() {
  try {
    const stats = {
      status: cache.isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      hitRatio: 'N/A', // Would need to implement hit/miss tracking
      memory: process.memoryUsage(),
      keys: {}
    };

    // Sample key counts for different categories
    const keyPatterns = [
      { name: 'users_list', pattern: `${CACHE_KEYS.USERS_LIST}:*` },
      { name: 'user_detail', pattern: `${CACHE_KEYS.USER_DETAIL}:*` },
      { name: 'rate_limits', pattern: 'rate_limit:*' },
      { name: 'email_checks', pattern: 'user:email:*' }
    ];

    for (const { name, pattern } of keyPatterns) {
      try {
        const keyCount = await cache.redis?.keys(pattern).then(keys => keys.length) || 0;
        stats.keys[name] = keyCount;
      } catch (error) {
        stats.keys[name] = 'error';
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}

async function getCacheKeys() {
  try {
    const allKeys = cache.redis ? await cache.redis.keys('*') : [];
    const keysByCategory = {
      users: allKeys.filter(key => key.startsWith('users:') || key.startsWith('user:')),
      rateLimits: allKeys.filter(key => key.startsWith('rate_limit:')),
      other: allKeys.filter(key => !key.startsWith('users:') && !key.startsWith('user:') && !key.startsWith('rate_limit:'))
    };

    return NextResponse.json({
      totalKeys: allKeys.length,
      categories: keysByCategory,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get keys' }, { status: 500 });
  }
}

async function getCacheHealth() {
  try {
    const health = {
      redis: {
        connected: cache.isConnected,
        status: 'unknown'
      },
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    if (cache.redis && cache.isConnected) {
      try {
        const pong = await cache.redis.ping();
        health.redis.status = pong === 'PONG' ? 'healthy' : 'unhealthy';
        
        // Get Redis info if available
        const info = await cache.redis.info('memory');
        health.redis.info = info;
      } catch (error) {
        health.redis.status = 'error';
        health.redis.error = error.message;
      }
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check health' }, { status: 500 });
  }
}

// Cache management operations
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, pattern, ttl } = body;

    // Basic auth check (implement proper auth in production)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CACHE_ADMIN_TOKEN}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'clear':
        return await clearCache(pattern);
      case 'warm':
        return await warmCache();
      case 'set':
        return await setCache(body);
      case 'invalidate':
        return await invalidateCache(pattern);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Cache POST error:', error);
    return NextResponse.json(
      { error: 'Failed to execute cache operation' },
      { status: 500 }
    );
  }
}

async function clearCache(pattern = '*') {
  try {
    if (!cache.redis || !cache.isConnected) {
      return NextResponse.json(
        { error: 'Cache not connected' },
        { status: 503 }
      );
    }

    let deletedCount = 0;

    if (pattern === '*') {
      // Clear all cache
      const result = await cache.redis.flushdb();
      return NextResponse.json({
        message: 'All cache cleared',
        result,
        timestamp: new Date().toISOString()
      });
    } else {
      // Clear specific pattern
      const keys = await cache.redis.keys(pattern);
      if (keys.length > 0) {
        deletedCount = await cache.redis.del(...keys);
      }
    }

    return NextResponse.json({
      message: `Cache cleared for pattern: ${pattern}`,
      deletedKeys: deletedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

async function warmCache() {
  try {
    if (!cache.redis || !cache.isConnected) {
      return NextResponse.json(
        { error: 'Cache not connected' },
        { status: 503 }
      );
    }

    const warmupTasks = [];
    let successCount = 0;
    let errorCount = 0;

    // Add common cache warming operations here
    // Example: Pre-load frequently accessed data
    
    // Warm up user lists cache
    try {
      // This would typically fetch from your database and cache the results
      // await cache.set(CACHE_KEYS.USERS_LIST, userData, 3600);
      warmupTasks.push('users_list');
      successCount++;
    } catch (error) {
      console.error('Failed to warm users list cache:', error);
      errorCount++;
    }

    // Add more cache warming logic as needed
    // Example: Popular content, configuration data, etc.

    return NextResponse.json({
      message: 'Cache warming completed',
      tasks: warmupTasks,
      success: successCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Warm cache error:', error);
    return NextResponse.json(
      { error: 'Failed to warm cache' },
      { status: 500 }
    );
  }
}

async function setCache({ key, value, ttl = 3600 }) {
  try {
    if (!cache.redis || !cache.isConnected) {
      return NextResponse.json(
        { error: 'Cache not connected' },
        { status: 503 }
      );
    }

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const result = await cache.set(key, value, ttl);

    return NextResponse.json({
      message: 'Cache entry set successfully',
      key,
      ttl,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Set cache error:', error);
    return NextResponse.json(
      { error: 'Failed to set cache entry' },
      { status: 500 }
    );
  }
}

async function invalidateCache(pattern) {
  try {
    if (!cache.redis || !cache.isConnected) {
      return NextResponse.json(
        { error: 'Cache not connected' },
        { status: 503 }
      );
    }

    if (!pattern) {
      return NextResponse.json(
        { error: 'Pattern is required for invalidation' },
        { status: 400 }
      );
    }

    const keys = await cache.redis.keys(pattern);
    let deletedCount = 0;

    if (keys.length > 0) {
      deletedCount = await cache.redis.del(...keys);
    }

    return NextResponse.json({
      message: `Cache invalidated for pattern: ${pattern}`,
      pattern,
      matchedKeys: keys.length,
      deletedKeys: deletedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Invalidate cache error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

// DELETE method for cache cleanup
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const pattern = searchParams.get('pattern');

    // Basic auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CACHE_ADMIN_TOKEN}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!cache.redis || !cache.isConnected) {
      return NextResponse.json(
        { error: 'Cache not connected' },
        { status: 503 }
      );
    }

    let deletedCount = 0;

    if (key) {
      // Delete specific key
      deletedCount = await cache.redis.del(key);
      return NextResponse.json({
        message: `Key deleted: ${key}`,
        deleted: deletedCount > 0,
        timestamp: new Date().toISOString()
      });
    } else if (pattern) {
      // Delete by pattern
      const keys = await cache.redis.keys(pattern);
      if (keys.length > 0) {
        deletedCount = await cache.redis.del(...keys);
      }
      return NextResponse.json({
        message: `Keys deleted for pattern: ${pattern}`,
        matchedKeys: keys.length,
        deletedKeys: deletedCount,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: 'Either key or pattern parameter is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Cache DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete cache entries' },
      { status: 500 }
    );
  }
}