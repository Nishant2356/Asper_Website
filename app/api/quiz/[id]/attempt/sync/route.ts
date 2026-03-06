import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function PATCH(
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
        const body = await req.json();

        // Ensure an IN_PROGRESS attempt exists
        const existingAttempt = await prisma.quizAttempt.findFirst({
            where: { quizId, userId },
            orderBy: { createdAt: 'desc' },
        });

        if (!existingAttempt || existingAttempt.status !== "IN_PROGRESS") {
            return NextResponse.json({ error: "No active attempt found to sync." }, { status: 400 });
        }

        // Sync the timer and answers
        const updatedAttempt = await prisma.quizAttempt.update({
            where: { id: existingAttempt.id },
            data: {
                answers: body.answers ? JSON.stringify(body.answers) : existingAttempt.answers,
                timeLeft: body.timeLeft !== undefined ? body.timeLeft : existingAttempt.timeLeft,
            }
        });

        return NextResponse.json({ success: true, attempt: updatedAttempt });

    } catch (error) {
        console.error("Error syncing quiz attempt:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
