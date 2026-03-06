import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: quizId } = await params;
        const userId = session.user.id;

        // Fetch the quiz to get the time limit
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
                        // Exclude correctAnswer
                    },
                },
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        if (session.user.role !== "ADMIN" && !session.user.domain?.includes(quiz.department as any)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check for existing attempts
        const existingAttempt = await prisma.quizAttempt.findFirst({
            where: { quizId, userId },
            orderBy: { createdAt: 'desc' }
        });

        if (existingAttempt) {
            if (existingAttempt.status === "SUBMITTED" || existingAttempt.status === "GRADED") {
                // If they already finished, return the attempt so frontend can redirect them
                return NextResponse.json({
                    quiz,
                    attempt: existingAttempt
                });
            }

            // If an IN_PROGRESS attempt exists, return it to resume
            return NextResponse.json({
                quiz,
                attempt: existingAttempt
            });
        }

        // Generate an empty answers object
        const emptyAnswers = "{}";
        const initialTimeLeft = quiz.timeLimit ? quiz.timeLimit * 60 : null;

        // Creating a new IN_PROGRESS attempt
        const newAttempt = await prisma.quizAttempt.create({
            data: {
                userId,
                quizId,
                answers: emptyAnswers,
                status: "IN_PROGRESS",
                timeLeft: initialTimeLeft
            }
        });

        return NextResponse.json({
            quiz,
            attempt: newAttempt
        });

    } catch (error) {
        console.error("Error starting quiz attempt:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
