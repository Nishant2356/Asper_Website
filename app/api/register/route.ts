import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
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
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, domain } = userSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                domain,
                role: "MEMBER",
            },
        });

        // ─── CREATE NOTIFICATION FOR ADMIN ────────────
        await prisma.notification.create({
            data: {
                type: "NEW_USER",
                title: "New Member Registration",
                message: `${name} (${email}) has registered and is waiting for approval.`,
                data: JSON.stringify({
                    userId: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    domain: newUser.domain,
                }),
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            { user: userWithoutPassword, message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { message: "Invalid input", errors: (error as any).errors },
                { status: 400 }
            );
        }
        console.error("Registration Error:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}