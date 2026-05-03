import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hash } from "bcryptjs";
import { z } from "zod";

const createProfileSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["MEMBER", "ADMIN"]).default("MEMBER"),
    domain: z.array(
        z.enum([
            "DSA",
            "WEB_DEVELOPMENT",
            "IOT",
            "GAME_DEVELOPMENT_ANIMATION",
            "DEVOPS_CLOUD",
            "ML_DATA_SCIENCE",
            "MEDIA_GRAPHICS_VIDEO",
            "CORPORATE_RELATIONS",
            "PHOTOGRAPHY_VIDEO_EDITING",
        ])
    ),
    position: z.string().optional(),
    bio: z.string().optional(),
    profilePhoto: z.string().optional(),
    birthDate: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
});

// ─── POST: Admin creates a new member ────────────────
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden. Admin access required." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const parsed = createProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const {
            name,
            email,
            password,
            role,
            domain,
            position,
            bio,
            profilePhoto,
            birthDate,
            github,
            linkedin,
            instagram,
            twitter,
        } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                domain,
                position,
                bio,
                profilePhoto,
                birthDate: birthDate ? new Date(birthDate) : undefined,
                github,
                linkedin,
                instagram,
                twitter,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                domain: true,
                position: true,
                bio: true,
                profilePhoto: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            { user: newUser, message: "Profile created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── GET: Admin gets all members ─────────────────────
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
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role");
        const domain = searchParams.get("domain");

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    search
                        ? {
                              OR: [
                                  {
                                      name: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                                  {
                                      email: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                              ],
                          }
                        : {},
                    role ? { role: role as any } : {},
                    domain ? { domain: { has: domain as any } } : {},
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                domain: true,
                position: true,
                bio: true,
                profilePhoto: true,
                birthDate: true,
                github: true,
                linkedin: true,
                instagram: true,
                twitter: true,
                createdAt: true,
                _count: {
                    select: {
                        projects: true,
                        quizAttempts: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}