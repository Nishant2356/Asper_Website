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
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cacheInvalidate } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

type RequestType = "PROFILE" | "POSITION";

const editableProfileFields = [
    "name",
    "email",
    "bio",
    "profilePhoto",
    "github",
    "linkedin",
    "instagram",
    "twitter",
    "birthDate",
];

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
        const { action, requestType } = (await req.json()) as {
            action: "APPROVED" | "REJECTED";
            requestType: RequestType;
        };

        if (!["APPROVED", "REJECTED"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            );
        }

        if (!["PROFILE", "POSITION"].includes(requestType)) {
            return NextResponse.json(
                { error: "Invalid request type" },
                { status: 400 }
            );
        }

        // Profile update request
        if (requestType === "PROFILE") {
            const request = await prisma.profileUpdateRequest.findUnique({
                where: { id: requestId },
            });

            if (!request) {
                return NextResponse.json(
                    { error: "Profile update request not found" },
                    { status: 404 }
                );
            }

            if (request.status !== "PENDING") {
                return NextResponse.json(
                    { error: "This request has already been processed" },
                    { status: 400 }
                );
            }

            if (!editableProfileFields.includes(request.field)) {
                return NextResponse.json(
                    { error: "This profile field cannot be updated" },
                    { status: 400 }
                );
            }

            await prisma.$transaction(async (tx) => {
                await tx.profileUpdateRequest.update({
                    where: { id: requestId },
                    data: {
                        status: action,
                        reviewedAt: new Date(),
                        reviewedBy: session.user.id,
                    },
                });

                if (action === "APPROVED") {
                    const userData =
                        request.field === "birthDate"
                            ? { birthDate: new Date(request.newValue) }
                            : { [request.field]: request.newValue };

                    await tx.user.update({
                        where: { id: request.userId },
                        data: userData as Prisma.UserUpdateInput,
                    });
                }
            });

            return NextResponse.json({
                success: true,
                message: `Profile request ${action.toLowerCase()} successfully.`,
            });
        }

        // Position request
        const request = await prisma.positionRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            return NextResponse.json(
                { error: "Position request not found" },
                { status: 404 }
            );
        }

        if (request.status !== "PENDING") {
            return NextResponse.json(
                { error: "This request has already been processed" },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.positionRequest.update({
                where: { id: requestId },
                data: {
                    status: action,
                    reviewedAt: new Date(),
                    reviewedBy: session.user.id,
                },
            });

            if (action === "APPROVED") {
                await tx.userDomain.upsert({
                    where: {
                        userId_department: {
                            userId: request.userId,
                            department: request.department,
                        },
                    },

                    update: request.position
                        ? {
                            position: request.position,
                        }
                        : {},

                    create: {
                        userId: request.userId,
                        department: request.department,
                        ...(request.position
                            ? { position: request.position }
                            : {}),
                    },
                });
                // delete the position request after approval
                await tx.positionRequest.delete({
                    where: { id: requestId },
                });

            }else if (action === "REJECTED") {
                // delete the position request after rejection
                await tx.positionRequest.delete({
                    where: { id: requestId },
                });
            }
        });

        // ─── INVALIDATE ─────────────────────────────────
        // If approved, user's profile data changed → invalidate profile caches
        // Either way, the pending requests list changed
        await cacheInvalidate(
            `profile:${request.userId}`,
            "profiles:*"
        );

        return NextResponse.json({
            success: true,
            message: `Position request ${action.toLowerCase()} successfully.`,
        });
    } catch (error) {
        console.error("Error processing request:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}