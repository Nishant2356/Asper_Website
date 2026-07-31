/**
 * ─── GET /api/projects/public ───────────────────────────
 *
 * Public-facing project showcase. Fetches projects visible to all visitors.
 * Supports filtering by department and a "featured" mode that picks the
 * best project per department.
 *
 * CACHING STRATEGY:
 * - Cache key: "projects:public:{department}:{featured}"
 * - TTL: 5 minutes (projects are graded/added infrequently)
 * - Invalidated when: any project is created, updated, or deleted
 *
 * This is a HIGH-IMPACT cache because the project showcase page
 * is visited by every user browsing the website.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Department } from '@prisma/client';
import { cacheGet, cacheSet, TTL } from '@/lib/cache';
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Parse marks strings like "9/10", "85", "7.5/10", "" → a numeric score (or -1 if empty)
function parseMarks(marks: string): number {
    if (!marks || marks.trim() === '') return -1;
    // Handle "X/Y" format — use X as the raw score
    const slashMatch = marks.match(/^([\d.]+)\s*\/\s*([\d.]+)$/);
    if (slashMatch) {
        const num = parseFloat(slashMatch[1]);
        return isNaN(num) ? -1 : num;
    }
    const num = parseFloat(marks);
    return isNaN(num) ? -1 : num;
}

export async function GET(request: Request) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(request);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const { searchParams } = new URL(request.url);
        const departmentParam = searchParams.get('department');
        const featuredParam = searchParams.get('featured');
        const isFeatured = featuredParam === 'true';

        // ─── Build cache key from query params ───────────
        const cacheKey = `projects:public:${departmentParam || "all"}:${isFeatured}`;

        // ─── Check cache ─────────────────────────────────
        const cached = await cacheGet<any[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // ─── Cache miss — query database ─────────────────
        const where: any = {};

        if (departmentParam && Object.values(Department).includes(departmentParam as Department)) {
            where.department = departmentParam as Department;
        }

        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                department: true,
                githubLink: true,
                liveLink: true,
                imageLinks: true,
                marks: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        let result;

        if (isFeatured) {
            // Pick the best project per department (highest marks → newest date)
            const bestByDept = new Map<string, typeof projects[number]>();
            for (const project of projects) {
                const existing = bestByDept.get(project.department);
                if (!existing) {
                    bestByDept.set(project.department, project);
                } else {
                    const existingScore = parseMarks(existing.marks);
                    const newScore = parseMarks(project.marks);
                    if (
                        newScore > existingScore ||
                        (newScore === existingScore &&
                            new Date(project.createdAt) > new Date(existing.createdAt))
                    ) {
                        bestByDept.set(project.department, project);
                    }
                }
            }
            // Sort department representatives: highest marks first, then newest
            const representatives = Array.from(bestByDept.values()).sort((a, b) => {
                const marksA = parseMarks(a.marks);
                const marksB = parseMarks(b.marks);
                if (marksB !== marksA) return marksB - marksA;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            result = representatives.slice(0, 3);
        } else {
            result = projects;
        }

        // ─── Store in cache ──────────────────────────────
        await cacheSet(cacheKey, result, TTL.LONG);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching public projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
