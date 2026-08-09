/**
 * ─── /api/quiz/[id] ─────────────────────────────────────
 *
 * GET:    Fetch a quiz with questions (cached per user role)
 * PATCH:  Update quiz (invalidates cache)
 * DELETE: Remove quiz (invalidates cache)
 *
 * NOTE: We DON'T cache quiz GET per-user because the response includes
 * the user's attempt status (personalized). Instead we cache per quiz ID
 * only for a short duration to help with repeated loads.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cacheInvalidate } from "@/lib/cache";
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

        // NOTE: We do NOT cache this endpoint because the response includes
        // the user's personal attempt status (attempts field filtered by userId).
        // Caching personalized data would show wrong attempt info to other users.
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    select: {
                        id: true,
                        type: true,
                        text: true,
                        options: true,
                        marks: true,
                        // Exclude correctAnswer so frontend doesn't get it
                    },
                },
                attempts: {
                    where: { userId: session.user.id },
                    select: { id: true, status: true },
                    take: 1,
                }
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        if (session.user.role !== "ADMIN" && !session.user.domain?.includes(quiz.department as any)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: quizId } = await params;

        await prisma.quiz.delete({
            where: { id: quizId },
        });

        // ─── INVALIDATE: quiz removed → refresh listings + leaderboard ───
        await cacheInvalidate("quizzes:*", `leaderboard:${quizId}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting quiz:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const session = await auth();
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: quizId } = await params;
        const body = await req.json();

        const updateData: any = {
            ...(body.status && { status: body.status }),
            ...(body.title && { title: body.title }),
            ...(body.description && { description: body.description }),
            ...(body.timeLimit && { timeLimit: body.timeLimit }),
        };

        if (body.questions) {
            const [updatedQuiz] = await prisma.$transaction([
                prisma.quiz.update({
                    where: { id: quizId },
                    data: updateData,
                }),
                prisma.question.deleteMany({
                    where: { quizId },
                }),
                prisma.quiz.update({
                    where: { id: quizId },
                    data: {
                        questions: {
                            create: body.questions.map((q: any) => ({
                                type: q.type as any,
                                text: q.text,
                                options: q.options || [],
                                correctAnswer: q.correctAnswer,
                                marks: q.marks,
                            })),
                        },
                    },
                }),
            ]);

            // ─── INVALIDATE after quiz update ────────────────
            await cacheInvalidate("quizzes:*", `leaderboard:${quizId}`);

            return NextResponse.json(updatedQuiz);
        } else {
            const updatedQuiz = await prisma.quiz.update({
                where: { id: quizId },
                data: updateData,
            });

            // ─── INVALIDATE after quiz update ────────────────
            await cacheInvalidate("quizzes:*", `leaderboard:${quizId}`);

            return NextResponse.json(updatedQuiz);
        }

    } catch (error) {
        console.error("Error updating quiz:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
