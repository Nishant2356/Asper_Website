/**
 * ─── RATE LIMITER CONFIGURATION ─────────────────────────
 *
 * This file defines multiple rate limiters for different parts of the app.
 * Each limiter has different thresholds because different routes have
 * different risk levels and usage patterns.
 *
 * ═══════════════════════════════════════════════════════════
 * WHAT IS RATE LIMITING?
 * ═══════════════════════════════════════════════════════════
 *
 * Rate limiting restricts how many requests a user (identified by IP)
 * can make within a time window. It's the #1 defense against:
 *
 * 1. DoS attacks     — flooding your server with requests to take it down
 * 2. Brute force     — trying thousands of passwords to break into accounts
 * 3. Scraping        — bots downloading all your data
 * 4. Abuse           — one user consuming all server resources
 *
 * ═══════════════════════════════════════════════════════════
 * HOW DOES IT WORK? (Sliding Window Algorithm)
 * ═══════════════════════════════════════════════════════════
 *
 * We use the "Sliding Window" algorithm (provided by @upstash/ratelimit).
 *
 * Imagine a 60-second window that constantly moves forward in time:
 *
 *   |←── 60 seconds ──→|
 *   [req][req][req]......[req]  ← If you make 20 requests in this window
 *                                  and the limit is 20, the next request
 *                                  gets BLOCKED (HTTP 429: Too Many Requests)
 *
 * "Sliding" means the window isn't fixed to clock boundaries.
 * If you make a request at 12:00:30, your window is 12:00:30 → 12:01:30.
 * This prevents the "burst at boundary" problem that fixed windows have.
 *
 * ═══════════════════════════════════════════════════════════
 * WHY DIFFERENT LIMITS FOR DIFFERENT ROUTES?
 * ═══════════════════════════════════════════════════════════
 *
 * Not all routes are equal:
 *
 * - Login (POST /api/auth):
 *   VERY strict (5 req/min). An attacker trying passwords needs thousands
 *   of attempts. 5/min makes brute force take ~3 days for 20,000 passwords.
 *
 * - Registration (POST /api/register):
 *   Strict (3 req/min). Nobody legitimately registers 3 accounts in a minute.
 *   Prevents spam account creation bots.
 *
 * - Forgot Password (POST /api/auth/forgot-password):
 *   VERY strict (3 req/15min). Sends emails → costs money and can be abused
 *   for email bombing.
 *
 * - API reads (GET routes):
 *   Moderate (30 req/min). Normal browsing might trigger 10-15 requests
 *   per page load. 30 gives headroom while blocking scrapers.
 *
 * - API writes (POST/PATCH/DELETE):
 *   Moderate (15 req/min). Legitimate users rarely make 15 writes per minute.
 */

import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

/**
 * ─── AUTH RATE LIMITER ──────────────────────────────────
 * For: Login, Register, Password Reset
 * Limit: 5 requests per 60 seconds per IP
 *
 * WHY SO STRICT?
 * These are the most attacked endpoints on any website.
 * A brute force attack on login tries thousands of passwords.
 * 5 per minute means an attacker can only try 5 passwords/minute
 * = 7,200 per day. A strong password is safe at this rate.
 */
export const authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "ratelimit:auth",
    // analytics: true enables tracking in Upstash dashboard
    analytics: true,
});

/**
 * ─── REGISTRATION RATE LIMITER ──────────────────────────
 * For: POST /api/register
 * Limit: 3 requests per 60 seconds per IP
 *
 * Even stricter than login. Nobody creates 3 accounts
 * in a minute legitimately.
 */
export const registerLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "60 s"),
    prefix: "ratelimit:register",
    analytics: true,
});

/**
 * ─── FORGOT PASSWORD RATE LIMITER ───────────────────────
 * For: POST /api/auth/forgot-password
 * Limit: 3 requests per 15 minutes per IP
 *
 * EXTRA STRICT because this endpoint sends emails.
 * An attacker could abuse it to:
 * 1. Email-bomb a victim's inbox
 * 2. Rack up your SMTP costs
 * 3. Get your email domain blacklisted by spam filters
 */
export const forgotPasswordLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "900 s"), // 900s = 15 minutes
    prefix: "ratelimit:forgot-password",
    analytics: true,
});

/**
 * ─── GENERAL API RATE LIMITER ───────────────────────────
 * For: All other API routes (GET, POST, PATCH, DELETE)
 * Limit: 30 requests per 60 seconds per IP
 *
 * This is the "catch-all" limiter. It prevents:
 * - Scrapers from downloading all your data
 * - Buggy frontend code from making infinite requests
 * - General abuse from any single IP
 *
 * 30/min is generous enough for normal users. A typical page
 * load triggers 3-5 API calls. Even rapid navigation won't
 * hit 30 in a minute.
 */
export const apiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "ratelimit:api",
    analytics: true,
});

/**
 * ─── HELPER: Get client IP from request ─────────────────
 *
 * In production (behind a reverse proxy like Vercel, Nginx, etc.),
 * the real client IP is in the `x-forwarded-for` header.
 * In development, it's usually `127.0.0.1` or `::1`.
 *
 * We also check `x-real-ip` (used by some proxies like Nginx).
 *
 * SECURITY NOTE: x-forwarded-for can be spoofed by the client.
 * In production, your hosting provider (Vercel, etc.) sets it
 * correctly and strips any client-set values. If you're self-hosting,
 * make sure your reverse proxy does the same.
 */
export function getClientIp(req: Request): string {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    // The first one is the real client IP
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    // Some proxies use x-real-ip instead
    const realIp = req.headers.get("x-real-ip");
    if (realIp) {
        return realIp;
    }

    // Fallback for development
    return "127.0.0.1";
}

/**
 * ─── HELPER: Build rate limit response ──────────────────
 *
 * Returns a proper 429 (Too Many Requests) response with
 * standard headers that tell the client:
 *
 * - X-RateLimit-Limit:     Maximum requests allowed in the window
 * - X-RateLimit-Remaining: How many requests are left
 * - X-RateLimit-Reset:     Unix timestamp when the window resets
 * - Retry-After:           Seconds until the client can retry
 *
 * These headers follow the IETF draft standard for rate limiting.
 * Well-behaved clients (and browsers) use these to back off automatically.
 */
export function rateLimitResponse(
    reset: number,
    limit: number,
    remaining: number
) {
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);

    return new Response(
        JSON.stringify({
            error: "Too many requests",
            message: "You've exceeded the rate limit. Please wait before trying again.",
            retryAfter: retryAfterSeconds,
        }),
        {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "X-RateLimit-Limit": String(limit),
                "X-RateLimit-Remaining": String(remaining),
                "X-RateLimit-Reset": String(reset),
                "Retry-After": String(retryAfterSeconds),
            },
        }
    );
}
