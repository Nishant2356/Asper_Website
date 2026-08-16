import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

class RateLimitError extends CredentialsSignin {
    code = "Too many login attempts. Please wait a minute before trying again.";
}
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { authLimiter } from "@/lib/rate-limit";

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                domains: {
                    select: { department: true },
                },
            },
        });
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials, request) {
                // ─── LOGIN RATE LIMITING ────────────────────────────
                // NextAuth v5 passes the standard Request object as the 2nd argument
                let ip = "127.0.0.1";
                if (request && request.headers) {
                    const forwarded = request.headers.get("x-forwarded-for");
                    const realIp = request.headers.get("x-real-ip");
                    if (forwarded) ip = forwarded.split(",")[0].trim();
                    else if (realIp) ip = realIp;
                }

                const limitResult = await authLimiter.limit(ip);
                console.log(`[AUTH RATE LIMIT] IP: ${ip}, Success: ${limitResult.success}, Remaining: ${limitResult.remaining}`);
                if (!limitResult.success) {
                    console.warn(`[RATE LIMIT] Blocked brute force login attempt from IP: ${ip}`);
                    // By throwing a specific CredentialsSignin error, NextAuth passes the message to the frontend.
                    throw new RateLimitError();
                }

                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    const passwordsMatch = await compare(password, user.password);

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            domain: user.domains.map((item) => item.department),
                        };
                    }
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],

});

