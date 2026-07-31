/**
 * ─── /api/profile/admin ─────────────────────────────────
 *
 * POST: Admin creates a new member (invalidates cache)
 * GET:  Admin fetches all members with search/filter (cached)
 *
 * CACHING STRATEGY:
 * - GET is cached with key "profiles:admin:{search}:{role}:{domain}"
 * - TTL: 3 minutes (admin might be actively managing members)
 * - POST invalidates all profile caches
 *
 * NOTE: Admin search queries generate unique cache keys based on
 * the search term, role filter, and domain filter. This means
 * each unique search combination gets its own cached result.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hash } from "bcryptjs";
import { z } from "zod";
import { cacheGet, cacheSet, cacheInvalidate, TTL } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const createProfileSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["MEMBER", "ADMIN"]).default("MEMBER"),
    domain: z.array(
        z.enum([
            "DSA",
            "WEB_DEVELOPMENT",
            "IOT",
            "GAME_DEVELOPMENT_ANIMATION",
            "DEVOPS_CLOUD",
            "ML_DATA_SCIENCE",
            "MEDIA_GRAPHICS_VIDEO",
            "CORPORATE_RELATIONS",
            "PHOTOGRAPHY_VIDEO_EDITING",
        ])
    ),
    position: z.string().optional(),
    bio: z.string().optional(),
    profilePhoto: z.string().optional(),
    birthDate: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
});

// ─── POST: Admin creates a new member ────────────────
export async function POST(req: NextRequest) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden. Admin access required." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const parsed = createProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const {
            name,
            email,
            password,
            role,
            domain,
            position,
            bio,
            profilePhoto,
            birthDate,
            github,
            linkedin,
            instagram,
            twitter,
        } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                domain,
                position,
                bio,
                profilePhoto,
                birthDate: birthDate ? new Date(birthDate) : undefined,
                github,
                linkedin,
                instagram,
                twitter,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                domain: true,
                position: true,
                bio: true,
                profilePhoto: true,
                createdAt: true,
            },
        });

        // ─── INVALIDATE: New user → refresh all profile listings ──
        await cacheInvalidate("profiles:*");

        return NextResponse.json(
            { user: newUser, message: "Profile created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── GET: Admin gets all members ─────────────────────
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
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role");
        const domain = searchParams.get("domain");

        // ─── Build cache key ─────────────────────────────
        // We include search params so "search=john" gets a different cache
        // than "search=jane". This prevents returning wrong results.
        const cacheKey = `profiles:admin:${search}:${role || "all"}:${domain || "all"}`;

        // ─── Check cache ─────────────────────────────────
        const cached = await cacheGet<any[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // ─── Cache miss — query database ─────────────────
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    search
                        ? {
                              OR: [
                                  {
                                      name: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                                  {
                                      email: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                              ],
                          }
                        : {},
                    role ? { role: role as any } : {},
                    domain ? { domain: { has: domain as any } } : {},
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                domain: true,
                position: true,
                bio: true,
                profilePhoto: true,
                birthDate: true,
                github: true,
                linkedin: true,
                instagram: true,
                twitter: true,
                createdAt: true,
                _count: {
                    select: {
                        projects: true,
                        quizAttempts: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // ─── Cache for 3 minutes ─────────────────────────
        // Slightly shorter than public profiles because admin
        // might be actively managing members
        await cacheSet(cacheKey, users, TTL.MEDIUM);

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}