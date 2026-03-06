import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Check your auth import path
import { z } from "zod";

const prisma = new PrismaClient();

const quizSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    department: z.enum([
        "DSA",
        "WEB_DEVELOPMENT",
        "IOT",
        "GAME_DEVELOPMENT_ANIMATION",
        "DEVOPS_CLOUD",
        "ML_DATA_SCIENCE",
        "MEDIA_GRAPHICS_VIDEO",
        "CORPORATE_RELATIONS",
    ]),
    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).default("DRAFT"),
    timeLimit: z.number().int().optional(),
    questions: z.array(
        z.object({
            type: z.enum(["MCQ", "DYNAMIC"]),
            text: z.string(),
            options: z.array(z.string()).optional(),
            correctAnswer: z.string().optional(),
            marks: z.number().int().default(1),
        })
    ).min(1),
});

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user } = session;
        let quizzes;

        if (user.role === "ADMIN") {
            quizzes = await prisma.quiz.findMany({
                include: { questions: { select: { id: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Members only see active quizzes for their department
            // Assuming a member can only be in one department, or we check if user.domain intersects with quiz.department
            const userDepartments = user.domain || [];
            if (userDepartments.length === 0) {
                return NextResponse.json([]); // No department = no quizzes
            }

            quizzes = await prisma.quiz.findMany({
                where: {
                    status: "ACTIVE",
                    department: {
                        in: userDepartments,
                    },
                },
                include: { questions: { select: { id: true, marks: true } } }, // Don't send answers
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json(quizzes);
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
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

        // Ensure the admin is authorized for this department
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
                        type: q.type,
                        text: q.text,
                        options: q.options || [],
                        correctAnswer: q.correctAnswer,
                        marks: q.marks,
                    })),
                },
            },
        });

        return NextResponse.json(quiz, { status: 201 });
    } catch (error) {
        console.error("Error creating quiz:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
