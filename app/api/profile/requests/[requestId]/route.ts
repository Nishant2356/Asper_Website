import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const { requestId } = await params;
        const { action } = await req.json();

        if (!["APPROVED", "REJECTED"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            );
        }

        const request = await prisma.profileUpdateRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            return NextResponse.json(
                { error: "Request not found" },
                { status: 404 }
            );
        }

        await prisma.profileUpdateRequest.update({
            where: { id: requestId },
            data: {
                status: action,
                reviewedAt: new Date(),
                reviewedBy: session.user.id,
            },
        });

        if (action === "APPROVED") {
            await prisma.user.update({
                where: { id: request.userId },
                data: {
                    [request.field]:
                        request.field === "birthDate"
                            ? new Date(request.newValue)
                            : request.newValue,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: `Request ${action.toLowerCase()} successfully.`,
        });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}