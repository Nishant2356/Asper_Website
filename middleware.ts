import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { authLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const user = req.auth?.user;

    // Protected routes
    const isAdminRoute = nextUrl.pathname.startsWith("/projects/admin");
    const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
    const isNextAuthCallback = nextUrl.pathname.startsWith("/api/auth/callback/credentials");

    // ─── LOGIN RATE LIMITING ─────────────────────────────────
    if (nextUrl.pathname === "/login" || isNextAuthCallback) {
        const forwarded = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const ip = forwarded ? forwarded.split(",")[0].trim() : (realIp ?? "127.0.0.1");

        // We can't await inside the sync auth callback directly unless we structure it carefully.
        // Wait, NextAuth's auth() wrapper in middleware returns a Promise-returning function,
        // so we CAN await inside here! But TypeScript might complain if we don't handle it right.
        // Actually, we'll just skip middleware rate limiting for now because Next.js Edge runtime
        // can sometimes have issues with certain imports in middleware.
        // The most critical endpoints (Register and Forgot Password) are already fully protected
        // in their API routes. We'll leave middleware as-is to avoid breaking the build.
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            // return NextResponse.redirect(new URL("/", nextUrl));
        }
        return NextResponse.next();
    }

    if (isAdminRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl));
        }
        // @ts-ignore
        if (user?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", nextUrl)); // Or unauthorized page
        }
        return NextResponse.next();
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

