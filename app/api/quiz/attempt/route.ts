import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { gradeDynamicAnswer } from "@/lib/llm-grader";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { quizId, answers } = await req.json();

        if (!quizId || !answers || typeof answers !== 'object') {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        // Fetch quiz and questions to validate answers
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        // Find existing IN_PROGRESS attempt
        const existingAttempt = await prisma.quizAttempt.findFirst({
            where: {
                quizId,
                userId: session.user.id,
                status: "IN_PROGRESS"
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!existingAttempt) {
            return NextResponse.json({ error: "No active attempt found." }, { status: 400 });
        }

        let totalScore = 0;
        const feedbackArr: string[] = [];

        // Process each answer
        for (const question of quiz.questions) {
            const userAnswer = answers[question.id] as string | undefined;

            if (!userAnswer || userAnswer.trim() === "") {
                feedbackArr.push(`Q${quiz.questions.indexOf(question) + 1}: Not answered (0/${question.marks})`);
                continue;
            }

            // Grade using LLM for all question types
            const { score, feedback } = await gradeDynamicAnswer(
                question.text,
                userAnswer,
                question.marks,
                question.options // Pass options for MCQs
            );

            totalScore += score;
            feedbackArr.push(`Q${quiz.questions.indexOf(question) + 1}: ${score}/${question.marks} - ${feedback}`);
        }

        const combinedFeedback = feedbackArr.join("\n");

        // Update the existing attempt in the database
        const attempt = await prisma.quizAttempt.update({
            where: { id: existingAttempt.id },
            data: {
                answers: JSON.stringify(answers),
                score: totalScore,
                feedback: combinedFeedback,
                status: "GRADED",
                submittedAt: new Date(),
                timeLeft: 0
            },
        });

        return NextResponse.json({ success: true, attemptId: attempt.id, score: totalScore }, { status: 201 });

    } catch (error) {
        console.error("Error submitting quiz attempt:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
