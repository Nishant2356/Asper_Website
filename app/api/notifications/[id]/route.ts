/**
 * ─── /api/notifications/[id] ────────────────────────────
 *
 * PATCH:  Mark notification as read/actioned (invalidates cache)
 * DELETE: Remove notification (invalidates cache)
 *
 * Both mutations invalidate ALL notification caches because:
 * - Marking as read changes the unread count badge
 * - Deleting changes the notification list
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cacheInvalidate } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// ─── PATCH: Mark notification as read/actioned ────────
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params;
        const { status } = await req.json();

        if (!["READ", "ACTIONED"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        const notification = await prisma.notification.update({
            where: { id },
            data: {
                status,
                readAt: new Date(),
            },
        });

        // ─── INVALIDATE notification caches ──────────────
        // Both the list and the unread count need refreshing
        await cacheInvalidate("notifications:*");

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── DELETE: Remove notification ──────────────────────
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params;

        await prisma.notification.delete({
            where: { id },
        });

        // ─── INVALIDATE notification caches ──────────────
        await cacheInvalidate("notifications:*");

        return NextResponse.json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}