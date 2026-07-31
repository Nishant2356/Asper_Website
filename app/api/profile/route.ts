/**
 * ─── GET /api/profile ───────────────────────────────────
 *
 * Fetches a list of user profiles, optionally filtered by role and domain.
 * Used primarily by the Team page, which is visited by EVERY user.
 *
 * CACHING STRATEGY:
 * - Cache key: "profiles:{role}:{domain}" (e.g., "profiles:ADMIN:WEB_DEVELOPMENT")
 * - TTL: 5 minutes (profiles rarely change)
 * - Invalidated when: user registers, profile updated, user deleted
 *
 * WHY CACHE THIS?
 * The team page is one of the most visited pages. Every visitor triggers
 * a database query for ALL user profiles. With Redis, only the FIRST
 * visitor hits PostgreSQL; everyone else gets instant cached results.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, TTL } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const domain = searchParams.get("domain");

        // ─── STEP 1: Build a unique cache key ────────────
        // We include the query params in the key so different
        // filters get their own cached results.
        // "profiles:all:all" for no filters
        // "profiles:ADMIN:all" for role=ADMIN
        // "profiles:all:WEB_DEVELOPMENT" for domain=WEB_DEVELOPMENT
        const cacheKey = `profiles:${role || "all"}:${domain || "all"}`;

        // ─── STEP 2: Check Redis first ───────────────────
        const cached = await cacheGet<any[]>(cacheKey);
        if (cached) {
            // Cache HIT! Return immediately without touching PostgreSQL.
            return NextResponse.json(cached);
        }

        // ─── STEP 3: Cache MISS — query PostgreSQL ───────
        const where: any = {};
        if (role) where.role = role;
        if (domain) where.domain = { has: domain };

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                role: true,
                domain: true,
                bio: true,
                profilePhoto: true,
                position: true,
                github: true,
                linkedin: true,
                instagram: true,
                twitter: true,
                createdAt: true,
            },
            orderBy: { createdAt: "asc" },
        });

        // ─── STEP 4: Store in Redis for next time ────────
        await cacheSet(cacheKey, users, TTL.LONG);

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching profiles:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}