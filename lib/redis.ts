/**
 * ─── REDIS CLIENT SINGLETON ─────────────────────────────
 *
 * This file creates a single Redis connection that's reused across
 * all API routes, just like our Prisma singleton in lib/prisma.ts.
 *
 * We use Upstash Redis because:
 * 1. It's HTTP-based → works perfectly with serverless (Vercel, etc.)
 * 2. No persistent TCP connections needed (Next.js API routes are ephemeral)
 * 3. Generous free tier (10,000 requests/day)
 *
 * HOW IT WORKS:
 * - Upstash gives you a REST URL and a token (like an API key).
 * - Every Redis command (GET, SET, DEL) is sent as an HTTP request.
 * - This is slightly slower than a TCP connection (~1-2ms overhead)
 *   but infinitely more reliable in serverless environments.
 */

import { Redis } from "@upstash/redis";

// Create a singleton Redis client.
// The `Redis.fromEnv()` method automatically reads:
//   - UPSTASH_REDIS_REST_URL
//   - UPSTASH_REDIS_REST_TOKEN
// from your .env file. Clean and simple.
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default redis;
