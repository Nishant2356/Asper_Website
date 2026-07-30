import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const userSelect = {
    id: true,
    name: true,
    email: true,
    profilePhoto: true,
} as const;

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const [profileupdate, positionreq] = await Promise.all([
            prisma.profileUpdateRequest.findMany({
                where: {
                    status: "PENDING",
                },
                include: {
                    user: {
                        select: userSelect,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),

            prisma.positionRequest.findMany({
                where: {
                    status: "PENDING",
                },
                include: {
                    user: {
                        select: userSelect,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
        ]);

        return NextResponse.json({
            profileupdate,
            positionreq,
        });
    } catch (error) {
        console.error("Error fetching pending requests:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}