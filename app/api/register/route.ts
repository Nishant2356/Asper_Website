/**
 * ─── POST /api/register ─────────────────────────────────
 *
 * Registers a new user and creates a notification for admins.
 *
 * NOT CACHED (write-only), but INVALIDATES:
 * - "profiles:*" because the team page should show the new user
 * - "notifications:*" because a new notification was created
 */

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";
import { cacheInvalidate } from "@/lib/cache";
import { registerLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),

    domain: z
        .array(
            z.enum([
                "DSA",
                "WEB_DEVELOPMENT",
                "IOT",
                "GAME_DEVELOPMENT_ANIMATION",
                "DEVOPS_CLOUD",
                "ML_DATA_SCIENCE",
                "GRAPHICS",
                "CORPORATE_RELATIONS",
                "PHOTOGRAPHY_VIDEO_EDITING",
            ])
        )
        .min(1, "Select at least one domain."),
});

export async function POST(req: Request) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        // Registration is rate-limited to 3 requests/minute per IP.
        // Prevents spam account creation bots.
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await registerLimiter.limit(ip);
        if (!success) {
            return rateLimitResponse(reset, limit, remaining);
        }

        const body = await req.json();

        const { name, email, password, domain } = userSchema.parse(body);

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists." },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: "MEMBER",
                status: "PENDING",

                // Selected har domain ke liye UserDomain create hoga.
                domains: {
                    create: domain.map((department) => ({
                        department,
                        position: "LEARNER",
                    })),
                },
            },

            include: {
                domains: {
                    select: {
                        department: true,
                        position: true,
                    },
                },
            },
        });

        await prisma.notification.create({
            data: {
                type: "NEW_USER",
                title: "New Member Registration",
                message: `${name} (${normalizedEmail}) has registered and is waiting for approval.`,
                data: JSON.stringify({
                    userId: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    domains: newUser.domains,
                }),
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;

        // ─── INVALIDATE CACHES ───────────────────────────
        // New user → team page listing is stale
        // New notification → admin dashboard badge is stale
        await cacheInvalidate("profiles:*", "notifications:*");

        return NextResponse.json(
            {
                user: userWithoutPassword,
                message: "User created successfully.",
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    message: "Invalid input.",
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        console.error("Registration error:", error);

        return NextResponse.json(
            { message: "Something went wrong." },
            { status: 500 }
        );
    }
}