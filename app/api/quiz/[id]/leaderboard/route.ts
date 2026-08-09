/**
 * ─── GET /api/quiz/[id]/leaderboard ─────────────────────
 *
 * Fetches quiz leaderboard: all graded attempts ranked by score.
 * This is a popular page — students check it frequently after
 * submitting quizzes.
 *
 * CACHING STRATEGY:
 * - Cache key: "leaderboard:{quizId}"
 * - TTL: 1 minute (leaderboard updates when someone submits)
 * - Invalidated when: a quiz attempt is submitted/graded
 *
 * WHY ONLY 1 MINUTE TTL?
 * Leaderboards are time-sensitive. After a student submits a quiz,
 * they expect to see their rank appear quickly. 1 minute is a good
 * balance between freshness and reducing DB load.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cacheGet, cacheSet } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: quizId } = await params;

        // ─── Check cache ─────────────────────────────────
        const cacheKey = `leaderboard:${quizId}`;
        const cached = await cacheGet<any>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // ─── Cache miss — query database ─────────────────
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            select: {
                id: true,
                title: true,
                department: true,
                questions: { select: { marks: true } }
            }
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        if (session.user.role !== "ADMIN" && !session.user.domain?.includes(quiz.department as any)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

        const attempts = await prisma.quizAttempt.findMany({
            where: {
                quizId,
                score: { not: null }
            },
            include: {
                user: { select: { name: true } }
            },
            orderBy: [
                { score: 'desc' },
                { submittedAt: 'asc' }
            ]
        });

        const leaderboard = attempts.map((attempt, index) => ({
            id: attempt.id,
            userId: attempt.userId,
            userName: attempt.user.name,
            score: attempt.score,
            submittedAt: attempt.submittedAt || attempt.createdAt,
            rank: index + 1
        }));

        const result = {
            quiz: { id: quiz.id, title: quiz.title, department: quiz.department, totalMarks },
            leaderboard
        };

        // ─── Cache for 1 minute ──────────────────────────
        await cacheSet(cacheKey, result, 60);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
