import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const positionOrder: Record<string, number> = {
    PRESIDENT: 1,
    VICE_PRESIDENT: 2,
    CHAIR_MEMBER: 3,
    SECRETARY: 4,
    OPEN_SOURCE_EXECUTIVE: 5,
    TREASURER: 6,
    EVENT_MANAGER: 7,
    HEAD: 8,
    SOCIAL_MEDIA_MANAGER: 9,
    CO_HEAD: 10,
    CORE_MEMBER: 11,
    LEARNER: 12,
};

export async function GET() {
    try {
        const members = await prisma.userDomain.findMany({
            where: {
                user: {
                    status: "APPROVED",
                },
            },
            select: {
                id: true,
                department: true,
                position: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                        bio: true,
                        github: true,
                        linkedin: true,
                        instagram: true,
                        twitter: true,
                        
                    },
                },
            },
        });

        members.sort((a, b) => {
            return (
                positionOrder[a.position] - positionOrder[b.position] ||
                a.department.localeCompare(b.department) ||
                a.user.name.localeCompare(b.user.name)
            );
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error("Team API error:", error);

        return NextResponse.json(
            { error: "Unable to load team." },
            { status: 500 }
        );
    }
}