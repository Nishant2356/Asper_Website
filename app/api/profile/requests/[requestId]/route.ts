/**
 * ─── PATCH /api/profile/requests/[requestId] ────────────
 *
 * Admin approves or rejects a profile update request.
 * If approved, the user's profile is updated in the database.
 *
 * INVALIDATES:
 * - Profile caches (if approved, the user's data changed)
 * - Notification caches (the pending request list changed)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cacheInvalidate } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

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

        // ─── INVALIDATE ─────────────────────────────────
        // If approved, user's profile data changed → invalidate profile caches
        // Either way, the pending requests list changed
        await cacheInvalidate(
            `profile:${request.userId}`,
            "profiles:*"
        );

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