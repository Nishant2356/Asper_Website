import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ attemptId: string }> } // Await params in next 15+
) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { attemptId } = await params;

        const attempt = await prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                quiz: true,
            },
        });

        if (!attempt) {
            return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
        }

        // Admins can see any attempt; Members must own the attempt
        if (session.user.role !== "ADMIN" && attempt.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(attempt);
    } catch (error) {
        console.error("Error fetching attempt:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
