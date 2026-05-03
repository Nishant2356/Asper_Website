import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const domain = searchParams.get("domain");

        const where: any = {};
        if (role) where.role = role;
        if (domain) where.domain = { has: domain };

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                role: true,
                domain: true,
                bio: true,
                profilePhoto: true,
                position: true,
                github: true,
                linkedin: true,
                instagram: true,
                twitter: true,
                createdAt: true,
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching profiles:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}