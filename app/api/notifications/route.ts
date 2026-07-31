/**
 * ─── /api/notifications ─────────────────────────────────
 *
 * GET:  Fetch all notifications (admin only, cached)
 * HEAD: Get unread count for badge (cached separately)
 *
 * CACHING STRATEGY:
 * - GET cache key: "notifications:{status}" (filter-aware)
 * - HEAD cache key: "notifications:unread:count"
 * - TTL: 30 seconds (notifications should feel near-real-time)
 *
 * WHY ONLY 30 SECONDS?
 * Notifications are time-sensitive. When a new user registers,
 * the admin should see the notification within ~30 seconds.
 * This is a tradeoff: we still reduce DB calls by ~50% on the
 * admin dashboard while keeping data fresh enough.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cacheGet, cacheSet, TTL } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// ─── GET: Admin fetches all notifications ─────────────
export async function GET(req: NextRequest) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get("status");

        // ─── Check cache ─────────────────────────────────
        const cacheKey = `notifications:${statusFilter || "all"}`;
        const cached = await cacheGet<any[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // ─── Cache miss — query database ─────────────────
        const where: any = {};
        if (statusFilter) where.status = statusFilter;

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        // ─── Cache for 30 seconds ────────────────────────
        await cacheSet(cacheKey, notifications, TTL.SHORT);

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── GET unread count (for badge) ─────────────────────
export async function HEAD(req: NextRequest) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse(null, { status: 403 });
        }

        // ─── Check cache for count ───────────────────────
        const cacheKey = "notifications:unread:count";
        const cached = await cacheGet<number>(cacheKey);

        if (cached !== null) {
            return new NextResponse(null, {
                headers: { "X-Unread-Count": String(cached) },
            });
        }

        // ─── Cache miss — count from database ────────────
        const count = await prisma.notification.count({
            where: { status: "UNREAD" },
        });

        // ─── Cache for 30 seconds ────────────────────────
        await cacheSet(cacheKey, count, TTL.SHORT);

        return new NextResponse(null, {
            headers: { "X-Unread-Count": String(count) },
        });
    } catch (error) {
        return new NextResponse(null, { status: 500 });
    }
}