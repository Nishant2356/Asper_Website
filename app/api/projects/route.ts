/**
 * ─── /api/projects ──────────────────────────────────────
 *
 * POST: Create a new project (invalidates cache)
 * GET:  List projects, optionally filtered (cached)
 *
 * CACHING STRATEGY:
 * - GET cache key varies by the combination of userId and checked filter
 * - TTL: 3 minutes (projects might be graded by admin)
 * - POST invalidates ALL project caches (both private and public)
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Department } from '@prisma/client';
import { auth } from "@/auth";
import { cacheGet, cacheSet, cacheInvalidate, TTL } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(request);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, department, githubLink, liveLink, imageLinks, doubts } = body;

        if (!name || !department) {
            return NextResponse.json(
                { error: 'Name and Department are required' },
                { status: 400 }
            );
        }

        // Validate department enum
        if (!Object.values(Department).includes(department as Department)) {
            return NextResponse.json(
                { error: 'Invalid department' },
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                name,
                department: department as Department,
                githubLink,
                liveLink,
                imageLinks: imageLinks || [],
                doubts,
                user: {
                    connect: { id: session.user.id },
                },
            },
        });

        // ─── INVALIDATE: New project affects all project listings ─────
        // "projects:*" catches both private ("projects:user:xxx") and
        // public ("projects:public:xxx") cached listings
        await cacheInvalidate("projects:*");

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(request);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();

        const { searchParams } = new URL(request.url);
        const checkedParam = searchParams.get('checked');
        const userIdParam = searchParams.get('userId');

        // ─── Build cache key ─────────────────────────────
        const cacheKey = `projects:list:${userIdParam || "all"}:${checkedParam ?? "any"}`;

        // ─── Check cache ─────────────────────────────────
        const cached = await cacheGet<any[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // ─── Cache miss — query database ─────────────────
        const where: any = {};

        if (userIdParam) {
            if (session?.user?.id !== userIdParam && session?.user?.role !== 'ADMIN') {
                // unauthorized to view other's projects
            }
            where.userId = userIdParam;
        }

        if (checkedParam !== null) {
            where.checked = checkedParam === 'true';
        }

        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // ─── Store in cache (3 min — admin might be grading) ────
        await cacheSet(cacheKey, projects, TTL.MEDIUM);

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
