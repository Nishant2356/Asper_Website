import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const user = req.auth?.user;

    // Protected routes
    const isAdminRoute = nextUrl.pathname.startsWith("/projects/admin");
    const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");

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

