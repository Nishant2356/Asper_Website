import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ─── GET: Admin fetches all notifications ─────────────
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get("status");

        const where: any = {};
        if (statusFilter) where.status = statusFilter;

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── GET unread count (for badge) ─────────────────────
export async function HEAD(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse(null, { status: 403 });
        }

        const count = await prisma.notification.count({
            where: { status: "UNREAD" },
        });

        return new NextResponse(null, {
            headers: { "X-Unread-Count": String(count) },
        });
    } catch (error) {
        return new NextResponse(null, { status: 500 });
    }
}