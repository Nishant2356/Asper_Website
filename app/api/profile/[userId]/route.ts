/**
 * ─── /api/profile/[userId] ──────────────────────────────
 *
 * GET:   Fetch a single user's profile (cached)
 * PATCH: Update profile fields (invalidates cache)
 * DELETE: Remove a user (invalidates cache)
 *
 * CACHING STRATEGY:
 * - GET is cached with key "profile:{userId}", TTL 5 minutes
 * - PATCH/DELETE invalidate both the individual key AND all list caches
 *   because changing one profile affects the team page listing too.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cacheGet, cacheSet, cacheInvalidate, TTL } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// ─── GET: Fetch a user's profile ─────────────────────
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const { userId } = await params;

        // ─── Check cache first ───────────────────────────
        const cacheKey = `profile:${userId}`;
        const cached = await cacheGet<any>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // ─── Cache miss — hit PostgreSQL ─────────────────
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                domain: true,
                bio: true,
                profilePhoto: true,
                birthDate: true,
                position: true,
                github: true,
                linkedin: true,
                instagram: true,
                twitter: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // ─── Store in cache ──────────────────────────────
        await cacheSet(cacheKey, user, TTL.LONG);

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── PATCH: Update profile ────────────────────────────
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { userId } = await params;

        if (
            session.user.id !== userId &&
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();

        // Free fields — no approval needed
        const editableFields = [
            "bio",
            "profilePhoto",
            "github",
            "linkedin",
            "instagram",
            "twitter",
        ];

        // Restricted fields — need approval for non-admins
        const approvalFields = ["position", "birthDate"];

        const directUpdate: Record<string, any> = {};
        const approvalRequests: Promise<any>[] = [];

        for (const key of editableFields) {
            if (body[key] !== undefined) {
                directUpdate[key] = body[key];
            }
        }

        if (session.user.role !== "ADMIN") {
            for (const field of approvalFields) {
                if (body[field] !== undefined) {
                    const currentUser = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { [field]: true },
                    });

                    approvalRequests.push(
                        prisma.profileUpdateRequest.create({
                            data: {
                                userId,
                                field,
                                oldValue: currentUser
                                    ? String(
                                          (currentUser as any)[field] ?? ""
                                      )
                                    : "",
                                newValue: String(body[field]),
                                status: "PENDING",
                            },
                        })
                    );
                }
            }
        } else {
            for (const field of approvalFields) {
                if (body[field] !== undefined) {
                    directUpdate[field] =
                        field === "birthDate"
                            ? new Date(body[field])
                            : body[field];
                }
            }
        }

        const updatedUser =
            Object.keys(directUpdate).length > 0
                ? await prisma.user.update({
                      where: { id: userId },
                      data: directUpdate,
                      select: {
                          id: true,
                          name: true,
                          bio: true,
                          profilePhoto: true,
                          position: true,
                          birthDate: true,
                          github: true,
                          linkedin: true,
                          instagram: true,
                          twitter: true,
                      },
                  })
                : null;

        await Promise.all(approvalRequests);

        // ─── INVALIDATE CACHE ────────────────────────────
        // When a profile is updated, we need to:
        // 1. Delete the individual profile cache
        // 2. Delete ALL profile listing caches (team page could show stale data)
        //
        // "profiles:*" uses a wildcard to match ALL keys that start with "profiles:"
        // This catches "profiles:all:all", "profiles:ADMIN:all", etc.
        await cacheInvalidate(`profile:${userId}`, "profiles:*");

        return NextResponse.json({
            success: true,
            user: updatedUser,
            pendingApprovals: approvalRequests.length > 0,
            message:
                approvalRequests.length > 0
                    ? "Some fields require admin approval and have been submitted for review."
                    : "Profile updated successfully.",
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── DELETE: Admin only ───────────────────────────────
export async function DELETE(
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

        await prisma.user.delete({
            where: { id: userId },
        });

        // ─── INVALIDATE CACHE ────────────────────────────
        // User deleted — remove their individual cache AND refresh all listings
        await cacheInvalidate(`profile:${userId}`, "profiles:*");

        return NextResponse.json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}