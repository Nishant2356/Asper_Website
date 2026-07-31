# 🚀 Redis Integration Guide — Asper Website

## 📖 What is Redis?

**Redis** (Remote Dictionary Server) is an **in-memory data store**. Think of it like a super-fast dictionary (key-value store) that lives in your server's RAM instead of on disk.

### Why is it fast?
- **RAM vs Disk**: Reading from RAM is ~100x faster than reading from an SSD, and ~100,000x faster than a network round-trip to a database.
- **Simple data model**: Keys map to values. No complex SQL joins or table scans.

### The analogy
Imagine you're a librarian. Every time someone asks for a book, you walk to the warehouse (PostgreSQL), find it, and bring it back. **Redis is like keeping a shelf of the most-requested books right at your desk.** If someone asks for one of those books, you hand it over instantly. If it's not on your shelf, you walk to the warehouse, bring it back, AND put a copy on your shelf for next time.

---

## 🧠 Core Concepts

### 1. Key-Value Pairs
Everything in Redis is stored as `key → value`:
```
"user:abc123"  →  '{"name": "Nishant", "role": "ADMIN", ...}'
"profiles:all" →  '[{...}, {...}, ...]'
```
Redis doesn't care what the value is — it can be a string, a number, a JSON blob, anything. It just stores bytes and gives them back when you ask.

### 2. TTL (Time To Live)
Every key can have an **expiration time**. After that time, Redis automatically deletes it.
```
SET "profiles:all" "[data...]" EX 300    // Expires in 300 seconds (5 minutes)
```
**Why?** Data goes stale. If a user updates their profile, you don't want to serve the old version forever. TTL ensures the cache "refreshes" periodically.

**How to choose TTL values:**
| TTL | Use Case | Example |
|-----|----------|---------|
| 30 seconds | Data that changes frequently, needs to feel real-time | Notifications, unread counts |
| 2 minutes | Moderately changing data | Quiz listings (admin might activate/deactivate) |
| 5 minutes | Rarely changing data | User profiles, public project showcase |

### 3. Cache-Aside Pattern (What we use)
This is the most common and simplest caching strategy. Here's how it works step by step:

```
Request comes in (e.g., GET /api/profile)
  ↓
Step 1: Check Redis for key "profiles:all"
  ↓
  ├── HIT (data exists)?  → Return cached data immediately ✅
  │                          (PostgreSQL is never touched!)
  │
  └── MISS (key doesn't exist or expired)?
        ↓
      Step 2: Query PostgreSQL (the slow part)
        ↓
      Step 3: Store the result in Redis with a TTL
        ↓
      Step 4: Return the data to the user
```

**In code, this pattern looks like:**
```typescript
// Step 1: Check cache
const cached = await cacheGet("profiles:all");
if (cached) return NextResponse.json(cached); // HIT → done!

// Step 2: Cache miss → query database
const users = await prisma.user.findMany({ ... });

// Step 3: Store in cache for next time
await cacheSet("profiles:all", users, 300); // 300 seconds = 5 minutes

// Step 4: Return the data
return NextResponse.json(users);
```

### 4. Cache Invalidation
**"There are only two hard things in Computer Science: cache invalidation and naming things."** — Phil Karlton

When data **changes** (someone updates their profile, submits a project, etc.), the cached version becomes **stale** (outdated). We must **delete the stale cache** so the next request fetches fresh data from PostgreSQL.

**Example flow:**
```
1. User visits team page → Cache MISS → Query DB → Store in Redis
2. User visits team page → Cache HIT → Instant response ✅
3. New user registers → INVALIDATE "profiles:*" → Cache deleted
4. User visits team page → Cache MISS → Query DB → Store fresh data
5. User visits team page → Cache HIT → Instant response ✅ (with new user!)
```

**The `*` wildcard:** When we invalidate `"profiles:*"`, we delete ALL keys that start with `"profiles:"`. This catches:
- `profiles:all:all`
- `profiles:ADMIN:all`
- `profiles:all:WEB_DEVELOPMENT`
- `profiles:admin:john:all:all`

This is called **pattern-based invalidation** and it's how we handle cases where we don't know exactly which cached variations exist.

---

## 🔧 Why Upstash Redis?

We use **Upstash** instead of running our own Redis server. Here's why:

### The Problem with Traditional Redis
Traditional Redis (`ioredis`, `node-redis`) uses **persistent TCP connections**. This works great for traditional servers that run continuously, but Next.js API routes are **serverless** — each request might run in a fresh environment. Creating a new TCP connection for every request is slow and wastes resources.

### How Upstash Solves This
Upstash wraps Redis behind an **HTTP REST API**. Instead of maintaining a TCP connection, every Redis command is sent as a simple HTTP request:

```
Traditional Redis:     App ←──TCP Connection──→ Redis Server
Upstash Redis:         App ──HTTP POST──→ Upstash REST API ──→ Redis Server
```

**Benefits:**
- ✅ No connection management headaches
- ✅ Works in serverless environments (Vercel, AWS Lambda, etc.)
- ✅ Free tier: 10,000 requests/day (more than enough for a club website)
- ✅ ~1-2ms overhead per request (still WAY faster than a PostgreSQL query)

---

## 🏗️ Our Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                   (User's device)                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTE                        │
│                                                             │
│  1. Check Redis cache (cacheGet)                            │
│     ├── HIT → Return cached JSON (skip DB entirely)        │
│     └── MISS → Continue to step 2                          │
│                                                             │
│  2. Query PostgreSQL via Prisma                             │
│                                                             │
│  3. Store result in Redis (cacheSet)                        │
│                                                             │
│  4. Return JSON response                                    │
└───────────┬─────────────────────┬───────────────────────────┘
            │                     │
            ▼                     ▼
┌───────────────────┐   ┌───────────────────┐
│   UPSTASH REDIS   │   │   POSTGRESQL      │
│   (Cache Layer)   │   │   (Neon DB)       │
│                   │   │                   │
│  Fast (in-memory) │   │  Slow (on disk)   │
│  ~1-5ms response  │   │  ~50-200ms query  │
│  Ephemeral data   │   │  Persistent data  │
└───────────────────┘   └───────────────────┘
```

---

## 📁 File-by-File Explanation

### `lib/redis.ts` — The Redis Client

This is the equivalent of your `lib/prisma.ts`. It creates a **single Redis connection** that's reused across all API routes.

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,    // Your Upstash URL
    token: process.env.UPSTASH_REDIS_REST_TOKEN!, // Your Upstash auth token
});

export default redis;
```

**Key points:**
- `Redis` from `@upstash/redis` is an HTTP-based client (not TCP)
- The `!` after `process.env.XXX` tells TypeScript "trust me, this exists"
- We export a singleton — every import shares the same instance

### `lib/cache.ts` — The Cache Helpers

Three functions that every API route uses:

#### `cacheGet<T>(key)` — Check the cache
```typescript
export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        const cached = await redis.get<T>(key);
        if (cached !== null && cached !== undefined) {
            console.log(`[CACHE HIT] ${key}`);
            return cached;       // Found it! Return immediately.
        }
        console.log(`[CACHE MISS] ${key}`);
        return null;             // Not found — caller must query DB.
    } catch (error) {
        console.error(`[CACHE ERROR] Failed to GET ${key}:`, error);
        return null;             // Redis is down? No problem, just skip cache.
    }
}
```

**Why the try-catch?** If Redis is unreachable (network issue, Upstash down, etc.), we return `null` instead of crashing. The API route treats it as a cache miss and queries PostgreSQL directly. **This makes caching "graceful" — it's a speed boost, not a requirement.**

#### `cacheSet(key, data, ttl)` — Store in cache
```typescript
export async function cacheSet(key: string, data: unknown, ttl: number = 300): Promise<void> {
    try {
        await redis.set(key, JSON.stringify(data), { ex: ttl });
        // `ex` means "expire in X seconds"
        // After `ttl` seconds, Redis auto-deletes this key
    } catch (error) {
        console.error(`[CACHE ERROR] Failed to SET ${key}:`, error);
        // Don't throw — if caching fails, the response still works
    }
}
```

**`{ ex: ttl }`** is the Redis equivalent of saying "delete this after X seconds". Without it, data would live forever (and become stale).

#### `cacheInvalidate(...patterns)` — Delete stale caches
```typescript
export async function cacheInvalidate(...patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
        if (pattern.includes("*")) {
            // Wildcard: find all matching keys, then delete them
            const keys = await redis.keys(pattern);  // e.g., "profiles:*" → ["profiles:all:all", "profiles:ADMIN:all"]
            if (keys.length > 0) {
                await redis.del(...keys);  // Delete all at once
            }
        } else {
            await redis.del(pattern);  // Exact key deletion
        }
    }
}
```

**When do we call this?** Every time data is MODIFIED:
- `POST` (create) → invalidate related listing caches
- `PATCH` (update) → invalidate the specific item AND listing caches
- `DELETE` (remove) → invalidate the specific item AND listing caches

---

## 🎯 Cache Key Naming Convention

We use a consistent naming pattern: `entity:qualifier:filter`

```
profiles:all:all              → All profiles, no filters
profiles:ADMIN:all            → Profiles filtered by role=ADMIN
profiles:all:WEB_DEVELOPMENT  → Profiles filtered by domain
profile:abc123                → Single profile by userId
projects:public:all:true      → Public projects, featured=true
projects:list:abc123:any      → User abc123's projects
quizzes:admin:all             → All quizzes (admin view)
quizzes:member:DSA,IOT        → Quizzes for DSA and IOT departments
leaderboard:quiz456           → Leaderboard for a specific quiz
notifications:UNREAD          → Unread notifications
notifications:unread:count    → Just the count for the badge
```

**Why include filters in the key?** Because `GET /api/profile?role=ADMIN` returns DIFFERENT data than `GET /api/profile?domain=IOT`. If we used the same key for both, we'd return the wrong data!

---

## 🔄 Complete Invalidation Map

This table shows exactly which caches are deleted when data changes:

| When this happens... | ...these caches are deleted |
|---|---|
| New user registers | `profiles:*`, `notifications:*` |
| Profile updated (PATCH) | `profile:{userId}`, `profiles:*` |
| User deleted (DELETE) | `profile:{userId}`, `profiles:*` |
| Admin creates member | `profiles:*` |
| Profile request approved | `profile:{userId}`, `profiles:*` |
| Project created (POST) | `projects:*` |
| Project updated (PATCH) | `projects:*` |
| Project deleted (DELETE) | `projects:*` |
| Quiz created (POST) | `quizzes:*` |
| Quiz updated (PATCH) | `quizzes:*`, `leaderboard:{quizId}` |
| Quiz deleted (DELETE) | `quizzes:*`, `leaderboard:{quizId}` |
| Quiz attempt graded | `leaderboard:{quizId}` |
| Notification read/actioned | `notifications:*` |
| Notification deleted | `notifications:*` |

---

## ❓ Common Questions

### "What if Redis goes down?"
The app still works! Every `cacheGet` and `cacheSet` is wrapped in try-catch. If Redis fails, we just skip the cache and query PostgreSQL directly. The user never sees an error.

### "What if cached data is stale?"
Two safeguards:
1. **TTL** — Data auto-expires (30s to 5min depending on the route)
2. **Invalidation** — Every write operation explicitly deletes related caches

### "Does caching increase memory usage?"
Minimally. Upstash stores the data on their servers, not in your app's memory. Your app only stores the JSON response temporarily during the request.

### "Can I see what's in the cache?"
Yes! Go to your Upstash dashboard → Data Browser. You can see all keys, their values, and their remaining TTL.

### "What about race conditions?"
For our use case (a club website with moderate traffic), race conditions are extremely unlikely. If two users update profiles at the exact same millisecond, the worst case is one sees stale data for up to 5 minutes. For high-traffic production apps, you'd use Redis transactions (MULTI/EXEC) or distributed locks.
