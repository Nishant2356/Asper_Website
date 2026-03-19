import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Await params in next 15+
) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: quizId } = await params;

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

        // Admins can see any quiz; Members must be in the right department
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
        const session = await auth();
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: quizId } = await params;

        await prisma.quiz.delete({
            where: { id: quizId },
        });

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
        const session = await auth();
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: quizId } = await params;
        const body = await req.json();

        // Prepare update data
        const updateData: any = {
            ...(body.status && { status: body.status }),
            ...(body.title && { title: body.title }),
            ...(body.description && { description: body.description }),
            ...(body.timeLimit && { timeLimit: body.timeLimit }),
        };

        // If questions are provided, we overwrite them
        if (body.questions) {
            // Use an interactive transaction for complex dependent updates
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
            return NextResponse.json(updatedQuiz);
        } else {
            const updatedQuiz = await prisma.quiz.update({
                where: { id: quizId },
                data: updateData,
            });
            return NextResponse.json(updatedQuiz);
        }

    } catch (error) {
        console.error("Error updating quiz:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
