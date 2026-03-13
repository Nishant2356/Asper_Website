import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: quizId } = await params;

        // Fetch the quiz to ensure it exists and the user has access to it
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

        // Fetch all attempts for this quiz that have a score
        const attempts = await prisma.quizAttempt.findMany({
            where: {
                quizId,
                score: { not: null }
            },
            include: {
                user: { select: { name: true } }
            },
            orderBy: [
                { score: 'desc' }, // Highest score first
                { submittedAt: 'asc' } // Earliest submission first in case of a tie
            ]
        });

        // Format to LeaderboardEntry
        const leaderboard = attempts.map((attempt, index) => ({
            id: attempt.id,
            userId: attempt.userId,
            userName: attempt.user.name,
            score: attempt.score,
            submittedAt: attempt.submittedAt || attempt.createdAt,
            rank: index + 1
        }));

        return NextResponse.json({ quiz: { id: quiz.id, title: quiz.title, department: quiz.department, totalMarks }, leaderboard });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
