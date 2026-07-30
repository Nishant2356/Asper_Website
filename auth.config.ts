import type { NextAuthConfig } from "next-auth";
import { prisma } from "./lib/prisma";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
},
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role;
                token.domain = user.domain;
            }

            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;
                session.user.domain = token.domain;
            }

            return session;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
