import { NextRequest, NextResponse } from "next/server";
import { Department, Position } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const PositionSchema = z.object({
    position: z.nativeEnum(Position),
    department: z.nativeEnum(Department),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized." },
                { status: 401 }
            );
        }

        const { userId } = await params;

        // Member sirf apne liye request kar sakta hai.
        // Admin kisi bhi member ka position update kar sakta hai.
        if (session.user.role !== "ADMIN" && session.user.id !== userId) {
            return NextResponse.json(
                { error: "Forbidden." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const parsed = PositionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid position or department.",
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const { position, department } = parsed.data;

        // Member: admin approval ke liye request create karega
        if (session.user.role !== "ADMIN") {
            const existingRequest = await prisma.positionRequest.findFirst({
                where: {
                    userId,
                    status: "PENDING",
                },
            });

            if (existingRequest) {
                return NextResponse.json(
                    { error: "You already have a pending position request." },
                    { status: 400 }
                );
            }

            await prisma.positionRequest.create({
                data: {
                    userId,
                    position,
                    department,
                    status: "PENDING",
                },
            });

            return NextResponse.json({
                success: true,
                message:
                    "Position request submitted successfully. Please wait for admin approval.",
            });
        }

        // Admin: same department ho to position update, warna naya domain create
        await prisma.userDomain.upsert({
            where: {
                userId_department: {
                    userId,
                    department,
                },
            },
            update: {
                position,
            },
            create: {
                userId,
                department,
                position,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Position updated successfully.",
        });
    } catch (error) {
        console.error("Position update error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}