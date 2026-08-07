import Redis from 'ioredis';
import { env } from '@config/env';
import { logger } from '@utils/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  retryStrategy: (times) => Math.min(times * 200, 3000),
  lazyConnect: true,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (error) => logger.error({ error }, 'Redis error'));

/**
 * Wraps a redis call so a Redis outage degrades to "cache miss" instead of
 * crashing the request. Mongo remains the source of truth either way.
 */
export async function safeRedisGet(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch (error) {
    logger.warn({ error, key }, 'Redis GET failed, falling back to database');
    return null;
  }
}

export async function safeRedisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch (error) {
    logger.warn({ error, key }, 'Redis SET failed, continuing without cache');
  }
}
