# 🛡️ Rate Limiting Guide — Asper Website

## 📖 What is Rate Limiting?

Rate limiting is a security technique that restricts how many requests a user (identified by their IP address) can make to your server within a specific timeframe. 

It is your **first line of defense** against:
1. **DoS (Denial of Service) Attacks**: Attackers flooding your server to crash it.
2. **Brute Force Attacks**: Hackers trying thousands of passwords on the login page.
3. **Data Scraping**: Bots downloading all your user profiles or projects.
4. **Financial Drain**: Attackers triggering paid APIs (like sending thousands of emails via SMTP).

---

## ⚙️ How Our System Works (Sliding Window Algorithm)

We use the `@upstash/ratelimit` package which implements the **Sliding Window** algorithm via Redis.

**Fixed Window (The Old Way):**
If the limit is 10 requests per minute, a user could make 10 requests at 12:00:59, and another 10 requests at 12:01:01. They essentially made 20 requests in 2 seconds, defeating the purpose.

**Sliding Window (Our Way):**
Imagine a 60-second window that constantly moves forward in time with the clock. If you make a request at 12:00:30, your window is 12:00:30 → 12:01:30. This perfectly prevents burst attacks at clock boundaries.

---

## 🚦 Our Rate Limiting Tiers

Not all endpoints are equally dangerous. We created 4 separate limiters in `lib/rate-limit.ts` to apply appropriate strictness based on the risk profile of the route.

| Limiter | Limit | Target Routes | Why this limit? |
|---------|-------|---------------|-----------------|
| **`authLimiter`** | 5 req / 60s | Reset Password | Prevents brute-forcing reset tokens. 5 attempts per minute max. |
| **`registerLimiter`** | 3 req / 60s | `POST /api/register` | Nobody legitimately registers 3 accounts in a minute. Prevents bot account creation. |
| **`forgotPasswordLimiter`** | 3 req / 15m | `POST /api/auth/forgot-password` | **Strictest**. Sends an email. Prevents attackers from email-bombing users or draining SMTP credits. |
| **`apiLimiter`** | 30 req / 60s | All other API routes | Prevents scraping and general DoS. A typical user loading a page triggers ~3-5 requests, so 30/min offers plenty of headroom. |

---

## 💻 How It Looks in Code

We injected the rate limiter at the very top of our API route handlers. If a user exceeds the limit, the server immediately rejects the request without ever talking to PostgreSQL.

```typescript
// Example from app/api/profile/route.ts
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
    try {
        // 1. Get the user's IP (handles reverse proxies like Vercel)
        const ip = getClientIp(req);
        
        // 2. Check the limit via Redis
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        
        // 3. If exceeded, block immediately
        if (!success) {
            return rateLimitResponse(reset, limit, remaining);
        }

        // ... continue with normal logic
    } catch (error) {
        // ...
    }
}
```

### The 429 Response (Too Many Requests)

When a user is blocked, our `rateLimitResponse` helper returns a standard HTTP 429 error along with specific headers that well-behaved clients and browsers use to back off:

- `X-RateLimit-Limit`: Maximum allowed requests
- `X-RateLimit-Remaining`: How many are left
- `X-RateLimit-Reset`: Timestamp when the window resets
- `Retry-After`: Seconds the client must wait

```json
{
  "error": "Too many requests",
  "message": "You've exceeded the rate limit. Please wait before trying again.",
  "retryAfter": 45
}
```

---

## 🧪 How to Test It

1. Start your local server (`npm run dev`).
2. Rapidly refresh a page that fetches from the API (like the Team page), or use an API testing tool (like Postman or curl) to hit `http://localhost:3000/api/profile` quickly.
3. After 30 requests within a minute, you will receive the `429 Too Many Requests` error.
4. Try the Forgot Password endpoint. After just 3 requests, you will be locked out for 15 minutes.

---

## 📊 Analytics & Monitoring

Because we enabled `analytics: true` in `lib/rate-limit.ts`, Upstash tracks all rate-limiting events!

1. Go to your **[Upstash Dashboard](https://console.upstash.com)**.
2. Select your `asper-website` Redis database.
3. Click on the **Rate Limiting** or **Analytics** tab.
4. You will see graphs showing:
   - Total allowed requests
   - Total blocked (rate-limited) requests
   - Which specific limiters (`ratelimit:auth`, `ratelimit:api`) are getting hit the most.

This allows you to see if your site is under attack in real-time!
