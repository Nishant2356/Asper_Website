/**
 * ─── /api/quiz ──────────────────────────────────────────
 *
 * GET:  List quizzes (admin sees all, members see active for their dept)
 * POST: Create a new quiz (admin only)
 *
 * CACHING STRATEGY:
 * - GET is cached with a key that includes the user's role and domains
 *   because admins and members see DIFFERENT quiz sets.
 * - TTL: 2 minutes (quizzes might be activated/deactivated)
 * - POST invalidates all quiz caches
 *
 * NOTE: We use the shared Prisma singleton here instead of
 * creating a new PrismaClient() on each request.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { cacheGet, cacheSet, cacheInvalidate, TTL } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { Department, QuestionType, QuizStatus } from "@prisma/client";
const quizSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    department: z.nativeEnum(Department),
    status: z.nativeEnum(QuizStatus).default("DRAFT"),
    timeLimit: z.number().int().optional(),
    questions: z.array(
        z.object({
            type: z.nativeEnum(QuestionType),
            text: z.string(),
            options: z.array(z.string()).optional(),
            correctAnswer: z.string().optional(),
            marks: z.number().int().default(1),
        })
    ).min(1),
});

export async function GET(req: NextRequest) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user } = session;

        // ─── Build cache key based on what this user sees ─────
        // Admins see ALL quizzes, members only see active ones for their depts.
        // We must cache these separately because the data is different.
        const userDepartments = user.domain || [];
        const cacheKey = user.role === "ADMIN"
            ? "quizzes:admin:all"
            : `quizzes:member:${userDepartments.sort().join(",")}`;

        // ─── Check cache ─────────────────────────────────
        const cached = await cacheGet<any[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // ─── Cache miss — query database ─────────────────
        let quizzes;

        if (user.role === "ADMIN") {
            quizzes = await prisma.quiz.findMany({
                include: { questions: { select: { id: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            if (userDepartments.length === 0) {
                return NextResponse.json([]);
            }

            quizzes = await prisma.quiz.findMany({
                where: {
                    status: "ACTIVE",
                    department: {
                        in: userDepartments,
                    },
                },
                include: { questions: { select: { id: true, marks: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }

        // ─── Store in cache (2 min) ──────────────────────
        await cacheSet(cacheKey, quizzes, TTL.MEDIUM);

        return NextResponse.json(quizzes);
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = quizSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid data", details: result.error.issues }, { status: 400 });
        }

        const data = result.data;
        const userDomains = session.user.domain || [];

        if (userDomains.length > 0 && !userDomains.includes(data.department as any)) {
            return NextResponse.json({ error: "Forbidden: You are not authorized to create quizzes for this department." }, { status: 403 });
        }

        const quiz = await prisma.quiz.create({
            data: {
                title: data.title,
                description: data.description,
                department: data.department,
                status: data.status,
                timeLimit: data.timeLimit,
                createdBy: session.user.id,
                questions: {
                    create: data.questions.map((q) => ({
                        type: q.type as any,
                        text: q.text,
                        options: q.options || [],
                        correctAnswer: q.correctAnswer,
                        marks: q.marks,
                    })),
                },
            },
        });

        // ─── INVALIDATE: New quiz → refresh all quiz listings ─────
        await cacheInvalidate("quizzes:*");

        return NextResponse.json(quiz, { status: 201 });
    } catch (error) {
        console.error("Error creating quiz:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
