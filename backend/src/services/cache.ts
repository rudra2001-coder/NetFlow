/**
 * Redis caching layer for performance optimization
 */

import Redis from 'ioredis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Redis client instance
let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 */
export async function initializeRedis(): Promise<Redis | null> {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD || undefined,
      db: config.REDIS_DB,
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts during initialization to avoid blocking startup
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 2000, // Short timeout for initialization
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (err) => {
      // Don't flood logs with connection errors in dev if it's already failed
      logger.error({ err: err.message }, 'Redis client error');
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.warn({ error }, 'Redis initialization failed - running without cache');
    redisClient = null;
    return null;
  }
}

/**
 * Get Redis client
 */
export function getRedisClient(): Redis | null {
  return redisClient;
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

const CACHE_PREFIX = 'netflow:';

/**
 * Build cache key with prefix
 */
function buildKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Get value from cache
 */
export async function get<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;

    const value = await client.get(buildKey(key));
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error({ key, error }, 'Cache get failed');
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;

    const serialized = JSON.stringify(value);
    const ttl = ttlSeconds || config.REDIS_CACHE_TTL;
    await client.setex(buildKey(key), ttl, serialized);
  } catch (error) {
    logger.error({ key, error }, 'Cache set failed');
  }
}

/**
 * Delete value from cache
 */
export async function del(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;

    await client.del(buildKey(key));
  } catch (error) {
    logger.error({ key, error }, 'Cache delete failed');
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function delPattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;

    const keys = await client.keys(buildKey(pattern));
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    logger.error({ pattern, error }, 'Cache pattern delete failed');
  }
}

/**
 * Check if key exists in cache
 */
export async function exists(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) return false;

    const result = await client.exists(buildKey(key));
    return result === 1;
  } catch (error) {
    logger.error({ key, error }, 'Cache exists check failed');
    return false;
  }
}

/**
 * Get or set cache pattern
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  const cached = await get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await fetcher();
  await set(key, value, ttlSeconds);
  return value;
}

// ============================================================================
// ROUTER-SPECIFIC CACHE
// ============================================================================

/**
 * Cache router status
 */
export async function cacheRouterStatus(routerId: string, status: object): Promise<void> {
  await set(`router:${routerId}:status`, status, 30);
}

/**
 * Get cached router status
 */
export async function getRouterStatus(routerId: string): Promise<object | null> {
  return get<object>(`router:${routerId}:status`);
}

/**
 * Invalidate router cache
 */
export async function invalidateRouterCache(routerId: string): Promise<void> {
  await delPattern(`router:${routerId}:*`);
}

/**
 * Cache PPP users for a router
 */
export async function cachePppUsers(routerId: string, users: object[]): Promise<void> {
  await set(`router:${routerId}:ppp-users`, users, 60);
}

/**
 * Get cached PPP users
 */
export async function getCachedPppUsers(routerId: string): Promise<object[] | null> {
  return get<object[]>(`router:${routerId}:ppp-users`);
}

/**
 * Cache interface statistics
 */
export async function cacheInterfaceStats(routerId: string, stats: object): Promise<void> {
  await set(`router:${routerId}:interfaces`, stats, 60);
}

/**
 * Get cached interface statistics
 */
export async function getCachedInterfaceStats(routerId: string): Promise<object | null> {
  return get<object>(`router:${routerId}:interfaces`);
}

/**
 * Cache system resources
 */
export async function cacheSystemResources(routerId: string, resources: object): Promise<void> {
  await set(`router:${routerId}:resources`, resources, 60);
}

/**
 * Get cached system resources
 */
export async function getCachedSystemResources(routerId: string): Promise<object | null> {
  return get<object>(`router:${routerId}:resources`);
}

// ============================================================================
// LOCKING
// ============================================================================

/**
 * Acquire a distributed lock
 */
export async function acquireLock(
  lockName: string,
  ttlSeconds: number = 30
): Promise<string | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;

    const lockKey = `lock:${lockName}`;
    const lockValue = `${Date.now()}:${Math.random().toString(36).slice(2)}`;

    const result = await client.set(lockKey, lockValue, 'EX', ttlSeconds, 'NX');
    if (result === 'OK') {
      return lockValue;
    }
    return null;
  } catch (error) {
    logger.error({ lockName, error }, 'Lock acquisition failed');
    return null;
  }
}

/**
 * Release a distributed lock
 */
export async function releaseLock(lockName: string, lockValue: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) return false;

    const lockKey = `lock:${lockName}`;

    // Only release if we own the lock
    const currentValue = await client.get(lockKey);
    if (currentValue === lockValue) {
      await client.del(lockKey);
      return true;
    }
    return false;
  } catch (error) {
    logger.error({ lockName, error }, 'Lock release failed');
    return false;
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Increment rate limit counter
 */
export async function incrementRateLimit(
  identifier: string,
  windowSeconds: number
): Promise<{ count: number; limit: number; resetAt: number }> {
  const client = getRedisClient();
  const limit = config.RATE_LIMIT_MAX;
  const now = Math.floor(Date.now() / 1000);
  const resetAt = now + windowSeconds;

  if (!client) {
    return { count: 0, limit, resetAt };
  }

  const key = `ratelimit:${identifier}`;
  const windowStart = now - (now % windowSeconds);
  const windowKey = `${key}:${windowStart}`;

  const pipeline = client.pipeline();
  pipeline.incr(windowKey);
  pipeline.expire(windowKey, windowSeconds * 2);
  const results = await pipeline.exec();

  const count = results?.[0]?.[1] as number ?? 0;

  return { count, limit, resetAt: windowStart + windowSeconds };
}

/**
 * Check if rate limit exceeded
 */
export async function isRateLimited(
  identifier: string,
  windowSeconds: number = 60
): Promise<{ limited: boolean; remaining: number; resetAt: number }> {
  const { count, limit, resetAt } = await incrementRateLimit(identifier, windowSeconds);
  return {
    limited: count > limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

// ============================================================================
// PUB/SUB
// ============================================================================

/**
 * Publish message to channel
 */
export async function publish(channel: string, message: object): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;
  return client.publish(channel, JSON.stringify(message));
}

/**
 * Subscribe to channel
 */
export function subscribe(
  channel: string,
  callback: (message: object) => void
): void {
  const client = getRedisClient();
  if (!client) return;

  const subscriber = client.duplicate();

  subscriber.subscribe(channel, (err) => {
    if (err) {
      logger.error({ channel, err }, 'Subscribe failed');
      return;
    }
  });

  subscriber.on('message', (receivedChannel, message) => {
    if (receivedChannel === channel) {
      try {
        callback(JSON.parse(message));
      } catch (error) {
        logger.error({ channel, error }, 'Message parse failed');
      }
    }
  });
}

// ============================================================================
// SHUTDOWN
// ============================================================================

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

export default {
  initializeRedis,
  getRedisClient,
  get,
  set,
  del,
  delPattern,
  exists,
  getOrSet,
  cacheRouterStatus,
  getRouterStatus,
  invalidateRouterCache,
  cachePppUsers,
  getCachedPppUsers,
  cacheInterfaceStats,
  getCachedInterfaceStats,
  cacheSystemResources,
  getCachedSystemResources,
  acquireLock,
  releaseLock,
  incrementRateLimit,
  isRateLimited,
  publish,
  subscribe,
  closeRedis,
};
