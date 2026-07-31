import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        // Prevents brute-forcing reset tokens.
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await authLimiter.limit(ip);
        if (!success) {
            return rateLimitResponse(reset, limit, remaining);
        }

        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
        }

        console.log("Attempting password reset for token:", token);
        console.log("Current time:", new Date());

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            // Debugging: Check if token exists but is expired, or doesn't exist at all
            const debugUser = await prisma.user.findUnique({ where: { resetToken: token } });

            if (debugUser) {
                const expiry = new Date(debugUser.resetTokenExpiry!);
                const now = new Date();
                console.log(`Token expired. Expiry: ${expiry.toISOString()}, Now: ${now.toISOString()}`);
                return NextResponse.json({
                    error: `Token expired. Expiry: ${expiry.toLocaleString()} vs Now: ${now.toLocaleString()}`
                }, { status: 400 });
            } else {
                console.log("Token not found in database.");
                return NextResponse.json({ error: "Invalid token (Not found in DB)" }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
