/**
 * ─── CACHE HELPER UTILITIES ─────────────────────────────
 *
 * This is the brain of our caching system. It provides three
 * simple functions that ALL our API routes will use:
 *
 * 1. cacheGet(key)        → Check if data exists in Redis
 * 2. cacheSet(key, data)  → Store data in Redis with a TTL
 * 3. cacheInvalidate(...) → Delete one or more cache keys
 *
 * THE CACHE-ASIDE PATTERN (used in every GET route):
 * ┌──────────────────────────────────────────────────┐
 * │ 1. Check Redis for cached data                   │
 * │ 2. If found (HIT) → return it immediately        │
 * │ 3. If not found (MISS) → query PostgreSQL        │
 * │ 4. Store the fresh result in Redis               │
 * │ 5. Return the result                             │
 * └──────────────────────────────────────────────────┘
 *
 * WHY WE WRAP REDIS IN HELPER FUNCTIONS:
 * - Centralized error handling: If Redis is down, the app still works
 *   (it just falls back to PostgreSQL — no crashes!)
 * - Consistent TTL management
 * - Easy to add logging/metrics later
 */

import redis from "./redis";

// ─── DEFAULT TTL VALUES (in seconds) ────────────────────
// These are the "shelf life" of cached data.
// Shorter TTL = fresher data but more DB hits.
// Longer TTL = fewer DB hits but data might be stale.
export const TTL = {
    SHORT: 30,      // 30 seconds — for rapidly changing data (notifications)
    MEDIUM: 120,    // 2 minutes  — for moderately changing data (quizzes)
    LONG: 300,      // 5 minutes  — for rarely changing data (profiles, public projects)
} as const;

/**
 * Attempt to GET data from the Redis cache.
 *
 * @param key - The cache key to look up (e.g., "profiles:all")
 * @returns The cached data (already parsed from JSON), or null if not found.
 *
 * WHY TRY-CATCH?
 * If Redis is down or unreachable, we don't want the entire API to crash.
 * We just return null (cache miss), and the route falls through to PostgreSQL.
 * This makes our caching "graceful" — it's an optimization, not a requirement.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        const cached = await redis.get<T>(key);
        if (cached !== null && cached !== undefined) {
            console.log(`[CACHE HIT] ${key}`);
            return cached;
        }
        console.log(`[CACHE MISS] ${key}`);
        return null;
    } catch (error) {
        console.error(`[CACHE ERROR] Failed to GET ${key}:`, error);
        return null; // Graceful fallback — just skip the cache
    }
}

/**
 * Store data in Redis with a TTL (expiration time).
 *
 * @param key  - The cache key (e.g., "profiles:all")
 * @param data - The data to cache (will be serialized to JSON by Upstash)
 * @param ttl  - Time to live in seconds (default: 5 minutes)
 *
 * Upstash's .set() with { ex: ttl } is equivalent to the Redis command:
 *   SET key value EX ttl
 *
 * After `ttl` seconds, Redis automatically deletes this key.
 * This prevents stale data from living forever.
 */
export async function cacheSet(key: string, data: unknown, ttl: number = TTL.LONG): Promise<void> {
    try {
        // `ex` means "expire in X seconds"
        // Upstash automatically serializes objects to JSON
        await redis.set(key, JSON.stringify(data), { ex: ttl });
        console.log(`[CACHE SET] ${key} (TTL: ${ttl}s)`);
    } catch (error) {
        console.error(`[CACHE ERROR] Failed to SET ${key}:`, error);
        // Don't throw — caching failure shouldn't break the response
    }
}

/**
 * Delete one or more cache keys. Used for INVALIDATION.
 *
 * WHEN TO CALL THIS:
 * Whenever data is MODIFIED (POST, PATCH, DELETE), we must delete
 * the related cache keys so the next GET fetches fresh data.
 *
 * Example: When a user updates their profile:
 *   cacheInvalidate(`profile:${userId}`, "profiles:*")
 *
 * PATTERN MATCHING (keys with "*"):
 * If a key contains "*", we use Redis SCAN to find all matching keys
 * and delete them in bulk. This is how we invalidate "all profiles"
 * when we don't know the exact key names.
 *
 * WHY SCAN instead of KEYS?
 * The KEYS command blocks the Redis server while it searches.
 * SCAN is non-blocking and iterates incrementally. For a small app
 * like ours, KEYS would be fine, but SCAN is the best practice.
 *
 * NOTE: Upstash doesn't support SCAN, so we use a workaround with
 * pattern-based deletion using the `keys` command, which is fine
 * for our scale (< 100 keys).
 */
export async function cacheInvalidate(...patterns: string[]): Promise<void> {
    try {
        for (const pattern of patterns) {
            if (pattern.includes("*")) {
                // Pattern-based deletion: find all matching keys, then delete them
                // Example: "profiles:*" matches "profiles:all", "profiles:ADMIN", etc.
                const keys = await redis.keys(pattern);
                if (keys.length > 0) {
                    // `del` accepts multiple keys and deletes them all in one call
                    await redis.del(...keys);
                    console.log(`[CACHE INVALIDATE] Pattern "${pattern}" → deleted ${keys.length} key(s)`);
                }
            } else {
                // Exact key deletion
                await redis.del(pattern);
                console.log(`[CACHE INVALIDATE] ${pattern}`);
            }
        }
    } catch (error) {
        console.error(`[CACHE ERROR] Failed to invalidate:`, error);
        // Don't throw — invalidation failure just means stale data for a bit
    }
}
