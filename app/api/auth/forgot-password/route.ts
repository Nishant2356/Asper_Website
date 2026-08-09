import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { forgotPasswordLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        // EXTRA STRICT: 3 requests per 15 minutes.
        // This endpoint sends emails — an attacker could:
        // 1. Email-bomb a victim's inbox
        // 2. Drain your SMTP quota
        // 3. Get your email domain blacklisted
        const ip = getClientIp(req);
        const { success, limit, remaining, reset } = await forgotPasswordLimiter.limit(ip);
        if (!success) {
            return rateLimitResponse(reset, limit, remaining);
        }

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        console.log(`User ${updatedUser.email} updated with token: ${updatedUser.resetToken}`);
        console.log(`Token Expiry stored: ${updatedUser.resetTokenExpiry}`);

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
        console.log("Reset URL:", resetUrl);

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send email
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Asper Support" <support@asper.com>',
            to: email,
            subject: "Password Reset Request",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset for your Asper account.</p>
                    <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
                    <a href="${resetUrl}" style="background-color: #ff0033; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });

        return NextResponse.json({ message: "If an account exists, a reset link has been sent." });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
