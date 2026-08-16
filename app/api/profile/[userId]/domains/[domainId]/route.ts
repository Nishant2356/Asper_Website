import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
    _req: Request,
    {
        params,
    }: {
        params: Promise<{
            userId: string;
            domainId: string;
        }>;
    }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { userId, domainId } = await params;

        const isOwner = session.user.id === userId;
        const isAdmin = session.user.role === "ADMIN";

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const userDomain = await prisma.userDomain.findUnique({
            where: {
                id: domainId,
            },
            select: {
                id: true,
                userId: true,
                department: true,
            },
        });

        if (!userDomain || userDomain.userId !== userId) {
            return NextResponse.json(
                { error: "Domain membership not found" },
                { status: 404 }
            );
        }

        await prisma.userDomain.delete({
            where: {
                id: domainId,
            },
        });

        return NextResponse.json({
            success: true,
            message: `Successfully exited ${userDomain.department.replace(
                /_/g,
                " "
            )}.`,
        });
    } catch (error) {
        console.error("Domain deletion error:", error);

        return NextResponse.json(
            { error: "Unable to exit this domain." },
            { status: 500 }
        );
    }
}