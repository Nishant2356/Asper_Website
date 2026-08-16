import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden. Admin access required." },
                { status: 403 }
            );
        }

        const { userId } = await params;
        const body = await req.json();

        // Update the user's team status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status: body.status },
            select: { id: true, name: true, status: true },
        });

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}